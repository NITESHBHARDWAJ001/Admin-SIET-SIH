/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1F2A8A",
          dark: "#161f66",
          light: "#2f3cae",
        },
        accent: "#E8B200",
        success: "#2DBB3C",
        surface: "#F8FAFC",
        ink: "#0F172A",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
