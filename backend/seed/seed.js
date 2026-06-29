/**
 * Seed script.
 *
 * Usage:
 *   npm run seed           -> inserts sample recipes (skips if already seeded)
 *   npm run seed:destroy   -> wipes Recipe + Tag collections
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Recipe = require('../models/Recipe');
const Tag = require('../models/Tag');
const sampleRecipes = require('./sampleData');
const { CURATED_TAGS } = require('../utils/curatedTags');

const destroy = process.argv.includes('--destroy');

const run = async () => {
  await connectDB();

  if (destroy) {
    await Recipe.deleteMany({});
    await Tag.deleteMany({});
    console.log('[seed] Cleared Recipe and Tag collections.');
    process.exit(0);
  }

  const existing = await Recipe.countDocuments();
  if (existing > 0) {
    console.log(`[seed] Database already has ${existing} recipes — skipping. Run "npm run seed:destroy" first to reset.`);
    process.exit(0);
  }

  await Recipe.insertMany(sampleRecipes);
  console.log(`[seed] Inserted ${sampleRecipes.length} sample recipes.`);

  // Seed the curated tag vocabulary as official tags, then tally real usage
  // from the sample recipes on top of that.
  await Tag.bulkWrite(
    CURATED_TAGS.map((name) => ({
      updateOne: { filter: { name }, update: { $set: { isCurated: true } }, upsert: true },
    }))
  );
  const allTags = sampleRecipes.flatMap((r) => r.tags);
  await Tag.registerTags(allTags);
  console.log('[seed] Registered tag usage counts.');

  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
