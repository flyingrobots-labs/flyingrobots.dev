/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal': {
          'bg-primary': '#0d1117',
          'bg-secondary': '#161b22',
          'bg-tertiary': '#21262d',
          'border': '#30363d',
          'text-primary': '#c9d1d9',
          'text-secondary': '#8b949e',
          'accent-blue': '#58a6ff',
          'accent-purple': '#7c3aed',
          'accent-red': '#f85149',
          'accent-green': '#238636',
          'code-string': '#a5d6ff',
          'code-number': '#79c0ff',
          'code-keyword': '#ff7b72',
          'code-function': '#d2a8ff',
        }
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      animation: {
        'cursor-blink': 'blink 1s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}