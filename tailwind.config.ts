import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0d1520",
          DEFAULT: "#1a2332",
          700: "#243347",
          mid: "#2b3a55",
          500: "#4a607e",
          light: "#8a9bb0",
          200: "#bcc8d8",
        },
        paper: {
          DEFAULT: "#f8f6f2",
          mid: "#ede9e1",
          dark: "#d8d2c8",
          white: "#ffffff",
        },
        bronze: {
          50: "#fdf5ed",
          100: "#f5e4cc",
          light: "#d4b896",
          DEFAULT: "#b8956a",
          dark: "#9a7a52",
          900: "#7a5c35",
        },
        gold: {
          light: "#e8cc7a",
          DEFAULT: "#c9a227",
          dark: "#a8841a",
        },
        violet: {
          100: "#ede5f9",
          light: "#a98de0",
          DEFAULT: "#7c5cbf",
          dark: "#5e3fa3",
        },
        forest: {
          100: "#d8f0e4",
          light: "#5aa37a",
          DEFAULT: "#3d7a5a",
          dark: "#2a5c3f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
        heading: ["var(--font-heading)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};
export default config;
