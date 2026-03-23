import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111827",
        border: "#1f2937",
        accent: "#2563eb",
        success: "#16a34a",
        warning: "#d97706"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
