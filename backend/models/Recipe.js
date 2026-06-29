const mongoose = require('mongoose');

/**
 * Recipe schema.
 *
 * Design decisions:
 * - `ingredients` and `instructions` are arrays of strings rather than a
 *   single block of text. This keeps the data structured (so the frontend
 *   can render a clean ingredient list / numbered steps) without forcing
 *   users into a rigid quantity/unit/name structure they didn't ask for.
 * - `country` and `state` are plain strings on the document itself instead
 *   of separate Country/State collections. The spec only requires Recipe
 *   and Tag models, and distinct countries/states are cheap to derive with
 *   Mongo's `distinct()`/aggregation — adding extra collections would just
 *   be duplicate state to keep in sync.
 * - A text index across recipeName, ingredients and tags powers the search
 *   feature (recipe name, ingredients, tags) requested in the spec.
 */
const recipeSchema = new mongoose.Schema(
  {
    recipeName: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
      maxlength: 120,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State/Region is required'],
      trim: true,
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one ingredient is required',
      },
    },
    instructions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one instruction step is required',
      },
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    },
    imageUrl: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
      maxlength: 600,
    },
    author: {
      type: String,
      trim: true,
      default: 'Anonymous Cook',
    },
  },
  { timestamps: true } // adds createdAt / updatedAt
);

// Text index powers the "search by name, ingredients, or tags" requirement.
// Weights bias matches in the recipe name above ingredient/tag matches.
recipeSchema.index(
  { recipeName: 'text', ingredients: 'text', tags: 'text' },
  { weights: { recipeName: 5, tags: 3, ingredients: 1 }, name: 'RecipeSearchIndex' }
);

// Supports the Country -> State browsing flow efficiently.
recipeSchema.index({ country: 1, state: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
