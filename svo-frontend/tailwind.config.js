import { UNSAFE_WithHydrateFallbackProps } from 'react-router-dom'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors:{
        douane:{
          primary: "#003366",
          secondary: "#0055A4",
          gold: "#D4AF37",
          ligth: "#F5F7FA",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
}

