const Tag = require('../models/Tag');
const asyncHandler = require('../utils/asyncHandler');
const { CURATED_TAGS } = require('../utils/curatedTags');

/**
 * GET /api/tags
 * Returns the curated tag vocabulary merged with any additional tags that
 * are actually in use (including ones Claude generated automatically),
 * each with a usage count, sorted by popularity. This is what populates
 * the filter chips on the Search page.
 */
const getTags = asyncHandler(async (req, res) => {
  const stored = await Tag.find().sort({ usageCount: -1 });
  const byName = new Map(stored.map((t) => [t.name, t.usageCount]));

  // Make sure every curated tag appears even if it hasn't been used yet,
  // so the filter UI always shows the full official tag set.
  CURATED_TAGS.forEach((name) => {
    if (!byName.has(name)) byName.set(name, 0);
  });

  const data = [...byName.entries()]
    .map(([name, usageCount]) => ({ name, usageCount, curated: CURATED_TAGS.includes(name) }))
    .sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name));

  res.json({ success: true, count: data.length, data });
});

module.exports = { getTags };
