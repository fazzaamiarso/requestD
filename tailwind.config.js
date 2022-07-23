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
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
