import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warme, kindvriendelijke basispalet — placeholder design tokens (hfst. 44)
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        success: { 500: "#22c55e" },
        info: { 500: "#0ea5e9" },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
