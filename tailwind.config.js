/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#020905",
          900: "#04150b",
          850: "#062012",
          800: "#0a2e1c",
          700: "#0f4228",
          600: "#155a37",
        },
        slate: {
          750: "#293548",
          850: "#172033",
          950: "#0b0f19",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "glow-emerald": "0 0 25px -4px rgba(16, 185, 129, 0.35)",
        "glow-emerald-lg": "0 0 35px -2px rgba(16, 185, 129, 0.45)",
      },
    },
  },
  plugins: [],
};
