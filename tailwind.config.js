/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      colors: {
        canvas: "#FAF8F4",
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#1C1917",
          soft: "#3B3733",
          muted: "#655F57",
          faint: "#7C7469",
        },
        line: {
          DEFAULT: "#E5E0D8",
          soft: "#EFEAE1",
          strong: "#D4CCBF",
        },
        vermillion: {
          DEFAULT: "#D9462A",
          dark: "#BC3A20",
          wash: "#FBEEE9",
          line: "#F1D2C7",
        },
        moss: {
          DEFAULT: "#3C5545",
          wash: "#EDF2ED",
          line: "#D3E0D5",
        },
      },
      maxWidth: {
        shell: "1200px",
        readable: "680px",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
    },
  },
  plugins: [],
};
