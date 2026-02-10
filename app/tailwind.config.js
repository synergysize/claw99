/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        'claw': {
          'green': '#22c55e',
          'yellow': '#eab308',
          'red': '#ef4444',
          'bg': '#ffffff',
          'border': '#e5e5e5',
          'text': '#171717',
          'muted': '#737373',
        }
      }
    },
  },
  plugins: [],
}
