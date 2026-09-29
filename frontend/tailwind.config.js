/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#111827",
        surface: "#0b1120",
        border: "#1f2937",
        accent: "#3b82f6",
        critical: "#ef4444",
        high: "#f97316",
        medium: "#eab308",
        low: "#22c55e",
      },
    },
  },
  plugins: [],
}
