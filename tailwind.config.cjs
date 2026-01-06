module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#0a3d31',
        'forest-green-light': '#0d5243',
        'forest-green-dark': '#062821',
        'brushed-gold': '#c5a059',
        'brushed-gold-light': '#d4b371',
        'brushed-gold-dark': '#a6893f',
        'hotel-forest': '#0a3d31',
        'hotel-forest-light': '#0d5243',
        'hotel-gold': '#c5a059',
        'hotel-gold-light': '#d4b371',
      },
      backgroundImage: {
        'gradient-forest': 'linear-gradient(135deg, #0a3d31, #0d5243)',
      },
    },
  },
  plugins: [],
};