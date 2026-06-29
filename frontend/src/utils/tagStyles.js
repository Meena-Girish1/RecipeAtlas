/**
 * Maps a tag name to a Tailwind class string so the same tag always reads
 * the same color everywhere it appears (filter chips, recipe cards, detail
 * page). Grouped by what the tag actually communicates — spice/flavor tags
 * lean chili-red, diet tags lean sage-green, meal-type and everything else
 * stays neutral ink — rather than assigning colors arbitrarily.
 */
const GROUPS = {
  chili: ['spicy', 'seafood'],
  saffron: ['sweet', 'dessert'],
  sage: ['vegetarian', 'vegan'],
};

export function tagChipClasses(tag, selected = false) {
  const name = tag.toLowerCase();
  let key = 'ink';
  if (GROUPS.chili.includes(name)) key = 'chili';
  else if (GROUPS.saffron.includes(name)) key = 'saffron';
  else if (GROUPS.sage.includes(name)) key = 'sage';

  const palettes = {
    chili: selected
      ? 'bg-chili-500 border-chili-500 text-white'
      : 'bg-chili-100 border-chili-100 text-chili-600 hover:border-chili-500',
    saffron: selected
      ? 'bg-saffron-500 border-saffron-500 text-ink-700'
      : 'bg-saffron-100 border-saffron-100 text-saffron-700 hover:border-saffron-500',
    sage: selected
      ? 'bg-sage-500 border-sage-500 text-white'
      : 'bg-sage-100 border-sage-100 text-sage-600 hover:border-sage-500',
    ink: selected
      ? 'bg-ink-600 border-ink-600 text-parchment-100'
      : 'bg-ink-50 border-ink-100 text-ink-500 hover:border-ink-600',
  };

  return palettes[key];
}
