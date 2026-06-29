const express = require('express');
const router = express.Router();
const {
  getCountries,
  getStatesByCountry,
  getRecipesByState,
} = require('../controllers/locationController');

router.get('/countries', getCountries);
router.get('/countries/:country/states', getStatesByCountry);
router.get('/countries/:country/states/:state/recipes', getRecipesByState);

module.exports = router;
