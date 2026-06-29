const Recipe = require('../models/Recipe');
const Tag = require('../models/Tag');
const asyncHandler = require('../utils/asyncHandler');
const { generateTags, generateSummary, rankSimilarRecipes } = require('../utils/claudeClient');
const { CURATED_TAGS } = require('../utils/curatedTags');

/** Normalizes a field that may arrive as a JSON string, a real array, or a newline-separated string (multipart/form-data sends everything as strings). */
const toArray = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== 'string' || value.trim() === '') return [];

  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      // fall through to newline/comma splitting below
    }
  }
  return trimmed
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
};

/** Builds the public URL for an uploaded file, or '' if none was uploaded. */
const buildImageUrl = (req) => (req.file ? `/uploads/${req.file.filename}` : '');

// ---------------------------------------------------------------------------
// POST /api/recipes — Add Recipe
// ---------------------------------------------------------------------------
const createRecipe = asyncHandler(async (req, res) => {
  const { recipeName, country, state, author } = req.body;
  const ingredients = toArray(req.body.ingredients);
  const instructions = toArray(req.body.instructions);
  let tags = toArray(req.body.tags);

  if (!recipeName || !country || !state || ingredients.length === 0 || instructions.length === 0) {
    res.status(400);
    throw new Error('recipeName, country, state, ingredients, and instructions are required');
  }

  // AI Feature A: auto-generate tags when the user leaves them blank.
  let tagSource = 'user';
  if (tags.length === 0) {
    try {
      tags = await generateTags({ recipeName, ingredients, instructions, curatedTags: CURATED_TAGS });
      tagSource = 'claude';
    } catch (err) {
      console.warn(`[ai] Tag generation skipped: ${err.message}`);
      tags = [];
      tagSource = 'none';
    }
  }

  const recipe = new Recipe({
    recipeName,
    country,
    state,
    ingredients,
    instructions,
    tags,
    author: author || undefined,
    imageUrl: buildImageUrl(req),
  });

  // AI Feature B: always generate a short summary for the details page.
  try {
    recipe.summary = await generateSummary({
      recipeName,
      country,
      state,
      ingredients,
      instructions,
      tags,
    });
  } catch (err) {
    console.warn(`[ai] Summary generation skipped: ${err.message}`);
  }

  await recipe.save();
  await Tag.registerTags(tags);

  res.status(201).json({ success: true, data: recipe, meta: { tagSource } });
});

// ---------------------------------------------------------------------------
// PUT /api/recipes/:id — Update Recipe
// ---------------------------------------------------------------------------
const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  const fields = ['recipeName', 'country', 'state', 'author'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== '') {
      recipe[field] = req.body[field];
    }
  });

  if (req.body.ingredients !== undefined) recipe.ingredients = toArray(req.body.ingredients);
  if (req.body.instructions !== undefined) recipe.instructions = toArray(req.body.instructions);
  if (req.body.tags !== undefined) recipe.tags = toArray(req.body.tags);
  if (req.file) recipe.imageUrl = buildImageUrl(req);

  // Allow the client to explicitly request a refreshed AI summary, e.g.
  // after editing ingredients/instructions significantly.
  if (req.body.regenerateSummary === 'true') {
    try {
      recipe.summary = await generateSummary({
        recipeName: recipe.recipeName,
        country: recipe.country,
        state: recipe.state,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: recipe.tags,
      });
    } catch (err) {
      console.warn(`[ai] Summary regeneration skipped: ${err.message}`);
    }
  }

  await recipe.save();
  await Tag.registerTags(recipe.tags);

  res.json({ success: true, data: recipe });
});

// ---------------------------------------------------------------------------
// DELETE /api/recipes/:id — Delete Recipe
// ---------------------------------------------------------------------------
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }
  res.json({ success: true, data: { _id: recipe._id } });
});

// ---------------------------------------------------------------------------
// GET /api/recipes/:id — Recipe Details
// ---------------------------------------------------------------------------
const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }
  res.json({ success: true, data: recipe });
});

// ---------------------------------------------------------------------------
// GET /api/recipes/latest?limit=8 — for the Home page
// ---------------------------------------------------------------------------
const getLatestRecipes = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 24);
  const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(limit);
  res.json({ success: true, data: recipes });
});

// ---------------------------------------------------------------------------
// GET /api/recipes/search?q=&tags=a,b — Search + Filter (combinable)
// ---------------------------------------------------------------------------
const searchRecipes = asyncHandler(async (req, res) => {
  const { q, tags, country, state } = req.query;
  const filter = {};

  if (tags) {
    const tagList = String(tags).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (tagList.length > 0) filter.tags = { $in: tagList };
  }
  if (country) filter.country = country;
  if (state) filter.state = state;

  let query;
  if (q && q.trim()) {
    // $text covers recipe name, ingredients, and tags (see the text index
    // defined on the Recipe model) and ranks by relevance via textScore.
    filter.$text = { $search: q.trim() };
    query = Recipe.find(filter, { score: { $meta: 'textScore' } }).sort({
      score: { $meta: 'textScore' },
    });
  } else {
    query = Recipe.find(filter).sort({ createdAt: -1 });
  }

  let recipes = await query.exec();

  // Fallback: $text requires whole-word matches, which can miss partial /
  // substring queries (e.g. "fish" not matching "shellfish"). If a text
  // search came up empty, retry with a case-insensitive regex across the
  // same fields so short or partial queries still surface results.
  if (q && q.trim() && recipes.length === 0) {
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const regexFilter = { ...filter };
    delete regexFilter.$text;
    regexFilter.$or = [{ recipeName: regex }, { ingredients: regex }, { tags: regex }];
    recipes = await Recipe.find(regexFilter).sort({ createdAt: -1 });
  }

  res.json({ success: true, count: recipes.length, data: recipes });
});

// ---------------------------------------------------------------------------
// GET /api/recipes/:id/similar — AI Feature C: Similar Recipe Suggestions
// ---------------------------------------------------------------------------
const getSimilarRecipes = asyncHandler(async (req, res) => {
  const target = await Recipe.findById(req.params.id);
  if (!target) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  // Step 1 (grounding): pull a real candidate set from MongoDB that
  // overlaps with the target on tags or ingredient keywords. This is what
  // keeps the feature honest — Claude can only choose from recipes that
  // actually exist and actually share something with the viewed recipe.
  const keywordSource = [...target.tags, ...target.ingredients.flatMap((i) => i.split(/\s+/))]
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter((w) => w.length > 2);
  const keywordRegexes = keywordSource.slice(0, 25).map((w) => new RegExp(w, 'i'));

  const candidates = await Recipe.find({
    _id: { $ne: target._id },
    $or: [{ tags: { $in: target.tags } }, { ingredients: { $in: keywordRegexes } }],
  })
    .limit(20)
    .select('recipeName tags ingredients country state imageUrl');

  if (candidates.length === 0) {
    return res.json({ success: true, data: [] });
  }

  // Step 2 (ranking): ask Claude to rank/select from the closed candidate
  // list. If the AI call fails for any reason, fall back to returning the
  // raw candidates unranked rather than failing the whole request.
  let ranked;
  try {
    const picks = await rankSimilarRecipes({ target, candidates });
    ranked = picks
      .filter((p) => Number.isInteger(p.index) && candidates[p.index])
      .map((p) => ({ recipe: candidates[p.index], reason: p.reason || '' }));
  } catch (err) {
    console.warn(`[ai] Similar-recipe ranking skipped, using raw candidates: ${err.message}`);
    ranked = candidates.slice(0, 5).map((recipe) => ({ recipe, reason: '' }));
  }

  res.json({ success: true, data: ranked });
});

module.exports = {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
  getLatestRecipes,
  searchRecipes,
  getSimilarRecipes,
};
