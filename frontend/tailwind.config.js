/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0a0a0a',
          cream: '#f4f0e6',
          gold: '#ffec27',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'sway': 'sway 12s ease-in-out infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'scaleY(1) translateX(0)', opacity: 0.6 },
          '50%': { transform: 'scaleY(1.05) translateX(10px)', opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
