/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#F4F4F4',
        sidebar: '#FFFFFF',
        accent: {
          orange: '#E8531D',
          'orange-light': '#FFF0EB',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        sidebar: '2px 0 8px rgba(0,0,0,0.04)',
        floating: '0 4px 20px rgba(0,0,0,0.15)',
        dropdown: '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
