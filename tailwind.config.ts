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
        // ACER Brand Colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff', 
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#5d6cd4',
          500: '#3244c7',
          600: '#3244c7',
          700: '#2938a8',
          800: '#1f2b8a',
          900: '#16206b',
          950: '#0d1347',
        },
        accent: {
          cyan: '#a3fffb',
          coral: '#ffa3a3',
          'cyan-dark': '#7dd3d8',
          'coral-dark': '#ff7b7b',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
};

export default config;