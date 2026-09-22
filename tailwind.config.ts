import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          hover: "#1D4ED8",
          container: "#2563EB",
          "on-container": "#eeefff",
        },
        secondary: {
          DEFAULT: "#515f74",
          container: "#d5e3fc",
          "on-container": "#57657a",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          background: "#F8FAFC",
          dim: "#d2d9f4",
          bright: "#faf8ff",
          container: "#eaedff",
          "container-low": "#f2f3ff",
          "container-high": "#e2e7ff",
          "container-highest": "#dae2fd",
          "on-surface": "#131b2e",
          "on-variant": "#434655",
        },
        brand: {
          primary: "#2563EB",
          "primary-dark": "#1D4ED8",
          background: "#F8FAFC",
          surface: "#FFFFFF",
          "text-primary": "#0F172A",
          "text-secondary": "#475569",
          "text-muted": "#94A3B8",
        },
        status: {
          success: "#16A34A",
          warning: "#D97706",
          error: "#DC2626",
          info: "#0284C7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      spacing: {
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "stack-xl": "48px",
      },
    },
  },
  plugins: [],
};

export default config;

