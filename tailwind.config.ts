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
        // ACER Brand Colors with Dynamic Branding Support
        primary: {
          50: 'var(--tw-color-primary-50)',
          100: 'var(--tw-color-primary-100)', 
          200: 'var(--tw-color-primary-200)',
          300: 'var(--tw-color-primary-300)',
          400: 'var(--tw-color-primary-400)',
          500: 'var(--tw-color-primary-500)',
          600: 'var(--tw-color-primary-600)',
          700: 'var(--tw-color-primary-700)',
          800: 'var(--tw-color-primary-800)',
          900: 'var(--tw-color-primary-900)',
          950: 'var(--primary-950)',
        },
        // Dynamic branding colors
        'brand-primary': 'var(--color-primary)',
        'brand-secondary': 'var(--color-secondary)',
        'brand-accent': 'var(--color-accent)',
        'brand-background': 'var(--color-background)',
        'brand-surface': 'var(--color-surface)',
        'brand-text': 'var(--color-text)',
        'brand-text-secondary': 'var(--color-text-secondary)',
        'brand-success': 'var(--color-success)',
        'brand-warning': 'var(--color-warning)',
        'brand-error': 'var(--color-error)',
        'brand-info': 'var(--color-info)',
        // Accent colors
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