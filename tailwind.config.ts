import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vinho: "#4E1233",
        bordo: "#6B0A0A",
        creme: "#F1F2DA",
        areia: "#FBE0B0",
        terracota: "#B65E5C",
        rosa: "#CE8A87",
        "off-white": "#FDFBFA",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "vinho-gradient": "linear-gradient(135deg, #4E1233 0%, #6B0A0A 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
