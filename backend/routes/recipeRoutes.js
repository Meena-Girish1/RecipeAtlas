const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
  getLatestRecipes,
  searchRecipes,
  getSimilarRecipes,
} = require('../controllers/recipeController');

// Order matters: specific literal paths (/latest, /search) must be
// registered before the dynamic "/:id" route, or Express will try to
// treat "latest"/"search" as an id.
router.get('/latest', getLatestRecipes);
router.get('/search', searchRecipes);

router.post('/', upload.single('image'), createRecipe);
router.get('/:id', getRecipeById);
router.get('/:id/similar', getSimilarRecipes);
router.put('/:id', upload.single('image'), updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;
