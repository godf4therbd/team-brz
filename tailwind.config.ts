import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Every value here is a CSS variable, not a fixed hex — the actual
        // colors live in globals.css (:root = dark, :root[data-theme=light]
        // = light overrides). That means every existing `bg-brz-black`,
        // `text-brz-white`, etc. class across the app automatically
        // repaints when the theme toggle flips data-theme, with zero
        // changes needed to the components using those classes.
        brz: {
          black: "var(--brz-black)",
          charcoal: "var(--brz-charcoal)",
          steel: "var(--brz-steel)",
          line: "var(--brz-line)",
          red: "var(--brz-red)",
          redDim: "var(--brz-red-dim)",
          amber: "var(--brz-amber)",
          white: "var(--brz-white)",
          mute: "var(--brz-mute)",
          // Fixed near-black in both themes — see the comment on
          // --brz-ink in globals.css. Use this (not brz-black) for text
          // sitting on a brz-red/brz-amber button.
          ink: "var(--brz-ink)",
        },
      },
      fontFamily: {
        display: ["Oswald", "Arial Narrow", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "checker-strip":
          "repeating-linear-gradient(135deg, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
