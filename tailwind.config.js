module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 48px rgba(127, 125, 255, 0.18)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(127, 125, 255, 0.18), transparent 32%)',
      },
    },
  },
  plugins: [],
};
