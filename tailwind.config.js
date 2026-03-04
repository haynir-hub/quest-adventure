/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'confetti-fall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: '0.8' },
        },
        'bounce-custom': {
          '0%, 100%': { transform: 'translateY(-15%) scale(1.05)' },
          '50%': { transform: 'translateY(0) scale(1)' },
        }
      },
      animation: {
        'confetti': 'confetti-fall 3s linear infinite',
        'bounce-custom': 'bounce-custom 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
