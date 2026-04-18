import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          glass: 'rgba(17, 24, 39, 0.6)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        title: ['var(--font-outfit)'],
      }
    },
  },
  plugins: [],
};
export default config;
