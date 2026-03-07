import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-blue-400)",
          strong: "var(--color-blue-500)",
          subtle: "var(--color-blue-500-10)",
        },
        surface: {
          base: "var(--color-slate-950)",
          elevated: "var(--color-slate-900)",
          muted: "var(--color-slate-800-35)",
          overlay: "var(--color-slate-900-45)",
        },
        content: {
          primary: "var(--color-slate-100)",
          secondary: "var(--color-slate-300)",
          muted: "var(--color-slate-400)",
          subtle: "var(--color-slate-500)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
