const express = require('express');
const router = express.Router();
const { suggestTags, suggestSummary } = require('../controllers/aiController');

router.post('/generate-tags', suggestTags);
router.post('/generate-summary', suggestSummary);

module.exports = router;
