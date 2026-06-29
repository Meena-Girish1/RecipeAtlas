/**
 * Design tokens for RecipeAtlas.
 *
 * Palette: a deep ink-teal (the "atlas cover") paired with a warm parchment
 * surface (the "map page"), accented by saffron (primary actions, route
 * lines, map pins), chili (spicy/destructive), and sage (vegetarian/vegan,
 * success). Kept deliberately off the generic cream/terracotta combo by
 * leaning the dark ink + saffron pairing forward as the dominant identity,
 * with parchment as the content surface rather than the hero itself.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16242B',
          50: '#EEF2F2',
          100: '#D7E0E1',
          200: '#9FB2B5',
          300: '#6C8488',
          400: '#3D5459',
          500: '#243A40',
          600: '#16242B',
          700: '#101A1F',
          800: '#0A1114',
          900: '#05090B',
        },
        parchment: {
          DEFAULT: '#FBF6EA',
          100: '#FFFDF8',
          200: '#FBF6EA',
          300: '#F2E9D4',
          400: '#E4D5B4',
        },
        saffron: {
          DEFAULT: '#E2A33D',
          100: '#FBEACB',
          300: '#EFC077',
          500: '#E2A33D',
          600: '#C2832A',
          700: '#96631D',
        },
        chili: {
          DEFAULT: '#C2452B',
          100: '#F6DAD2',
          500: '#C2452B',
          600: '#9C361F',
        },
        sage: {
          DEFAULT: '#5C8364',
          100: '#DCE8DE',
          500: '#5C8364',
          600: '#476850',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,36,43,0.06), 0 8px 24px -8px rgba(22,36,43,0.12)',
        cardHover: '0 4px 8px rgba(22,36,43,0.08), 0 16px 32px -12px rgba(22,36,43,0.2)',
      },
      borderRadius: {
        card: '0.875rem',
      },
    },
  },
  plugins: [],
};
