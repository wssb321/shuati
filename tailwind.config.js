/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      screens: {
        'xs': '320px',
        'sm': '360px',
        'md': '480px',
        'lg': '768px',
        'xl': '1024px',
        '2xl': '1280px',
      },
    },
  },
  plugins: [],
};
