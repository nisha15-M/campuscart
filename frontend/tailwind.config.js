/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FEFCF8",
          100: "#FAF6EC",
          200: "#F3EAD4",
        },
        ink: {
          900: "#14231C",
          800: "#1C2E24",
          700: "#2A3F32",
        },
        forest: {
          50: "#EAF3EC",
          100: "#CFE4D5",
          400: "#3E8362",
          500: "#2C6B4B",
          600: "#1F4B3A",
          700: "#173A2C",
          900: "#0E241B",
        },
        amber: {
          50: "#FDF3E2",
          100: "#FAE4B8",
          400: "#EFAD3E",
          500: "#E3941F",
          600: "#C87A12",
        },
        clay: {
          500: "#C0603F",
          600: "#A44A2E",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
        body: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(currentColor 1px, transparent 1px)",
        "loop-grid":
          "linear-gradient(rgba(20,35,28,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,35,28,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-sm": "16px 16px",
        "loop-sm": "28px 28px",
      },
      boxShadow: {
        stamp: "0 2px 0 rgba(20,35,28,0.12)",
        card: "0 1px 2px rgba(20,35,28,0.06), 0 8px 24px -8px rgba(20,35,28,0.18)",
        lift: "0 20px 40px -16px rgba(20,35,28,0.35)",
      },
      borderRadius: {
        blob: "42% 58% 65% 35% / 45% 40% 60% 55%",
      },
    },
  },
  plugins: [],
}
