/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        government: {
          blue: '#1E3A8A',
          lightBlue: '#3B82F6',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          accent: '#E2E8F0',
        }
      }
    },
  },
  plugins: [],
}
