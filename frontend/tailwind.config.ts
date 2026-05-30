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
        brand: {
          50: "#FFF5F0",
          100: "#FFE4D5",
          200: "#FFC2A0",
          300: "#FF9D6C",
          400: "#FF8147",
          500: "#FF6B35", // primary
          600: "#E85420",
          700: "#C13E13",
          800: "#962F0E",
          900: "#6E230B",
        },
        accent: {
          DEFAULT: "#FFB400", // warm saffron
          dark: "#D89400",
        },
        cream: {
          DEFAULT: "#FFF8F0",
          dark: "#F5EBDD",
        },
        ink: {
          DEFAULT: "#1F1F1F",
          soft: "#3B3B3B",
          muted: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(31, 31, 31, 0.06), 0 1px 3px rgba(31, 31, 31, 0.04)",
        "card-hover": "0 8px 24px rgba(255, 107, 53, 0.15), 0 2px 6px rgba(31, 31, 31, 0.08)",
        warm: "0 10px 30px rgba(255, 107, 53, 0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
