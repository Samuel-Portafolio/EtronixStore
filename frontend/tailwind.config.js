/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta profesional, sobria y accesible
        primary: "#4f46e5", // Indigo 600
        "background-light": "#f8fafc", // Slate 50
        "background-dark": "#0f172a", // Slate 900
        "text-light": "#0f172a", // Slate 900
        "text-dark": "#f8fafc", // Slate 50
        "text-secondary-light": "#64748b", // Slate 500
        "text-secondary-dark": "#94a3b8", // Slate 400
        "card-light": "#ffffff",
        "card-dark": "#111827", // Gray 900
        "border-light": "#e5e7eb", // Gray 200
        "border-dark": "#334155" // Slate 700
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"]
      }
    },
  },
  plugins: [],
};