/**
 * The "official" tag vocabulary from the project spec. Kept in one place so
 * the seed script, the /api/tags endpoint, and the Claude tag-suggestion
 * prompt all agree on the same list instead of drifting apart.
 */
const CURATED_TAGS = [
  'sweet',
  'savoury',
  'spicy',
  'vegetarian',
  'vegan',
  'seafood',
  'dessert',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

module.exports = { CURATED_TAGS };
