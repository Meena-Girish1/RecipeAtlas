const mongoose = require('mongoose');

/**
 * Tag schema.
 *
 * Tags are stored as their own collection (in addition to living inline on
 * Recipe.tags) so the app has a canonical, de-duplicated list of every tag
 * that has ever been used — including ones Claude generated automatically —
 * along with a usage count. This is what powers a stable filter UI instead
 * of re-aggregating distinct strings from every recipe on every request.
 */
const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isCurated: {
      type: Boolean,
      default: false, // true for the seeded "official" tag list (Sweet, Spicy, etc.)
    },
  },
  { timestamps: true }
);

/**
 * Upserts a batch of tag names and increments their usage counters.
 * Called whenever a recipe is created/updated with tags, or when Claude
 * generates tags automatically, so the Tag collection always reflects
 * what's actually in use.
 */
tagSchema.statics.registerTags = async function (tagNames = []) {
  const cleaned = [...new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (cleaned.length === 0) return;

  const ops = cleaned.map((name) => ({
    updateOne: {
      filter: { name },
      update: { $inc: { usageCount: 1 }, $setOnInsert: { name } },
      upsert: true,
    },
  }));

  await this.bulkWrite(ops);
};

module.exports = mongoose.model('Tag', tagSchema);
