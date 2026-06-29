const Recipe = require('../models/Recipe');
const asyncHandler = require('../utils/asyncHandler');

// ---------------------------------------------------------------------------
// GET /api/locations/countries
// Only countries that actually have at least one recipe are returned —
// there is no separate Country collection to go stale, so "exists" simply
// means "shows up in this aggregation".
// ---------------------------------------------------------------------------
const getCountries = asyncHandler(async (req, res) => {
  const countries = await Recipe.aggregate([
    { $group: { _id: '$country', recipeCount: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, country: '$_id', recipeCount: 1 } },
  ]);
  res.json({ success: true, count: countries.length, data: countries });
});

// ---------------------------------------------------------------------------
// GET /api/locations/countries/:country/states
// Per the spec: never display a state/region that has zero recipes. Since
// states live only as a field on Recipe documents (no separate collection),
// an empty state is structurally impossible to surface here — this query
// can only ever return states that have at least one matching recipe.
// ---------------------------------------------------------------------------
const getStatesByCountry = asyncHandler(async (req, res) => {
  const { country } = req.params;
  const states = await Recipe.aggregate([
    { $match: { country } },
    { $group: { _id: '$state', recipeCount: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, state: '$_id', recipeCount: 1 } },
  ]);

  if (states.length === 0) {
    res.status(404);
    throw new Error(`No recipes found for country "${country}"`);
  }

  res.json({ success: true, country, count: states.length, data: states });
});

// ---------------------------------------------------------------------------
// GET /api/locations/countries/:country/states/:state/recipes
// ---------------------------------------------------------------------------
const getRecipesByState = asyncHandler(async (req, res) => {
  const { country, state } = req.params;
  const recipes = await Recipe.find({ country, state }).sort({ createdAt: -1 });
  res.json({ success: true, country, state, count: recipes.length, data: recipes });
});

module.exports = { getCountries, getStatesByCountry, getRecipesByState };
