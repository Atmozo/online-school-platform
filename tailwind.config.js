module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#E5E7EB",
        accent: "#F59E0B",
      },
      fontFamily: {
        sans: ['"Open Sans"', "sans-serif"],
        heading: ['"Poppins"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
