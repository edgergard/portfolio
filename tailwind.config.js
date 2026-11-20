module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        ink: '#FFFFFF',
        'ink-2': '#C9C9CE',
        muted: '#8A8A93',
        'muted-2': '#5B5B63',
        line: '#222226',
        chip: '#16161A',
        wine: '#8B1426',
        'wine-2': '#B3122E',
        'wine-3': '#D0213F',
        // legacy tokens still referenced by components not yet redesigned
        'background': '#121212',
        'header-border': '#30323b',
        'text-secondary': '#adb7b0',
        'hero-icon-bg': '#181818',
        'blood': '#a855f7',
        'button-border': '#475569',
        'form-bg': '#18191E',
        'form-outline': '#33353F',
        'form-placeholder': '#9CA2A9',
        'button-main': '#8644c5',
        'red-1': '#ef4444',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
};
