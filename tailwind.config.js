/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#002547",
        "primary-container": "#1b3b5f",
        "on-primary": "#ffffff",
        "on-primary-container": "#88a6cf",
        "primary-fixed": "#d3e4ff",
        "primary-fixed-dim": "#abc8f4",
        "on-primary-fixed": "#001c38",
        "on-primary-fixed-variant": "#2a486d",
        "inverse-primary": "#abc8f4",

        "secondary": "#8b5000",
        "secondary-container": "#fda13a",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#6a3c00",
        "secondary-fixed": "#ffdcbe",
        "secondary-fixed-dim": "#ffb871",
        "on-secondary-fixed": "#2d1600",
        "on-secondary-fixed-variant": "#693c00",

        "tertiary": "#032641",
        "tertiary-container": "#1e3c58",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#8aa6c7",
        "tertiary-fixed": "#d0e4ff",
        "tertiary-fixed-dim": "#acc9eb",
        "on-tertiary-fixed": "#001d34",
        "on-tertiary-fixed-variant": "#2c4965",

        "surface": "#f7fafd",
        "surface-bright": "#f7fafd",
        "surface-dim": "#d7dadd",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f4f7",
        "surface-container": "#ebeef1",
        "surface-container-high": "#e5e8eb",
        "surface-container-highest": "#e0e3e6",
        "surface-variant": "#e0e3e6",
        "surface-tint": "#426086",

        "on-surface": "#181c1e",
        "on-surface-variant": "#43474e",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eef1f4",
        "background": "#f7fafd",
        "on-background": "#181c1e",

        "outline": "#73777f",
        "outline-variant": "#c3c6cf",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "success": "#137333",
        "success-container": "#e6f4ea",
        "on-success": "#ffffff",
        "on-success-container": "#0d5223"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "sm": "0.125rem",
        "md": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "4px",
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "gutter": "20px",
        "margin-mobile": "16px",
        "margin-desktop": "40px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "ambient": "0 4px 12px rgba(27, 59, 95, 0.08)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.05)",
        "modal": "0 20px 25px -5px rgba(0, 37, 71, 0.1), 0 10px 10px -5px rgba(0, 37, 71, 0.04)",
      }
    },
  },
  plugins: [],
}
