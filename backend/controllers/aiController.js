const asyncHandler = require('../utils/asyncHandler');
const { generateTags, generateSummary } = require('../utils/claudeClient');
const { CURATED_TAGS } = require('../utils/curatedTags');

/**
 * These two endpoints mirror the automatic AI behavior that already runs
 * inside recipeController.createRecipe, but exposed standalone so the Add
 * Recipe form can offer "Suggest tags" / "Preview summary" buttons and show
 * the user what Claude produced *before* they submit — rather than only
 * finding out after the recipe is saved.
 */

// POST /api/ai/generate-tags
const suggestTags = asyncHandler(async (req, res) => {
  const { recipeName, ingredients, instructions } = req.body;

  if (!recipeName || !Array.isArray(ingredients) || !Array.isArray(instructions)) {
    res.status(400);
    throw new Error('recipeName, ingredients (array), and instructions (array) are required');
  }

  const tags = await generateTags({ recipeName, ingredients, instructions, curatedTags: CURATED_TAGS });
  res.json({ success: true, data: tags });
});

// POST /api/ai/generate-summary
const suggestSummary = asyncHandler(async (req, res) => {
  const { recipeName, country, state, ingredients, instructions, tags } = req.body;

  if (!recipeName || !Array.isArray(ingredients) || !Array.isArray(instructions)) {
    res.status(400);
    throw new Error('recipeName, ingredients (array), and instructions (array) are required');
  }

  const summary = await generateSummary({
    recipeName,
    country: country || '',
    state: state || '',
    ingredients,
    instructions,
    tags: Array.isArray(tags) ? tags : [],
  });
  res.json({ success: true, data: summary });
});

module.exports = { suggestTags, suggestSummary };
