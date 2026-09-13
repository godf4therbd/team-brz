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
        brz: {
          black: "#0a0a0c",
          charcoal: "#161618",
          steel: "#232328",
          line: "#2c2c31",
          red: "#f5251f",
          redDim: "#a30f0f",
          amber: "#ffb703",
          white: "#f5f5f2",
          mute: "#9a9aa2",
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
