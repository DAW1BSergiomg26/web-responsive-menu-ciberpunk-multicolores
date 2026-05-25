/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        space: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        gold: "#FFD700",
        electric: "#00F5FF",
        neon: "#C026D3",
        deep: "#050816",
      },
    },
  },
};
