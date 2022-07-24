/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkBg: "#121212",
        cardBg: "#1f1f1e",
        textHeading: "#e2e3e3",
        textBody: "#a4a4a5",
        inputBg: "#2f2f2f",
        error: "#CF6679",
        materialPurple: {
          50: "#F2E7FE",
          100: "#DBB2FF",
          200: "#BB86FC",
          300: "#985EFF",
          400: "#7F39FB",
          500: "#6200EE",
          600: "#5600E8",
          700: "#3700B3",
          800: "#30009C",
          900: "#23036A",
        },
        materialGreen: {
          50: "#C8FFF4",
          100: "#70EFDE",
          200: "#03DAC5",
          300: "#00C4B4",
          400: "#00B3A6",
          500: "#01A299",
          600: "#019592",
          700: "#018786",
          800: "#017374",
          900: "#005457",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
