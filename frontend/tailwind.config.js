/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        cream: "#f5f1ea",
        ink: "#3b312b",
        terracotta: "#b9785d",
        terracottaDark: "#a66a51",
        sand: "#ebe5d9",
        border: "#e5dfd3",
        background: "#f5f1ea",
        foreground: "#3b312b",
        muted: {
          DEFAULT: "#ebe5d9",
          foreground: "#7a7067",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#3b312b",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
