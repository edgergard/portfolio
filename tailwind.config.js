module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        ink: '#FFFFFF',
        'ink-2': '#A3A3A9',
        muted: '#6E6E74',
        'muted-2': '#8C8C92',
        line: '#1E1E21',
        chip: '#2A2A2E',
        wine: '#8B1426',
        'wine-2': '#B3122E',
        'wine-3': '#D0213F',
        rule: '#3A3A40',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
};
