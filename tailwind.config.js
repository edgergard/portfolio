const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Theme colours are CSS variables (RGB channels, so /alpha works), set per theme in
      // styles.css: dark by default, [data-theme="light"] for the light theme.
      colors: {
        bg: v('bg'),
        ink: v('ink'),
        'ink-2': v('ink-2'),
        muted: v('muted'),
        'muted-2': v('muted-2'),
        line: v('line'),
        chip: v('chip'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        soft: v('soft'),
        'soft-2': v('soft-2'),
        'soft-3': v('soft-3'),
        rose: v('rose'),
        open: v('open'),
        wine: '#8B1426',
        'wine-2': '#B3122E',
        'wine-3': '#D0213F',
        rule: v('rule'),
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
};
