// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "laboratory-white": "#F6F6F6",
        "laboratory-black": "#0A0908",
      },
      fontFamily: {
        sans: ['"Devanagari Sangam MN"', "sans-serif"],
      },
      letterSpacing: {
        wide: "0.25em", // 25% letter spacing
      },
      fontSize: {
        regular: "12px",
        medium: "16px",
        title: "24px",
      },
    },
  },
  plugins: [],
}