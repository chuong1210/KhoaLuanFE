import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Orange Palette - Le Marchenoble Brand Colors
        orange: {
          vivid: '#FF6A00',      // Primary - buttons, accents
          warm: '#FF8A33',       // Secondary elements
          peach: '#FFB38A',      // Light backgrounds
          amber: '#FFB000',      // Highlights
          deep: '#E65100',       // Warnings/errors
          terracotta: '#D35400', // Borders
          apricot: '#FFF0E0',    // Soft backgrounds
        },
        // Semantic colors
        primary: {
          DEFAULT: '#FF6A00',
          foreground: '#FFFFFF',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6A00',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        secondary: {
          DEFAULT: '#FF8A33',
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: '#E65100',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#FFF0E0',
          foreground: '#111111',
        },
        accent: {
          DEFAULT: '#FFB38A',
          foreground: '#000000',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        border: '#D35400',
        input: '#FFB38A',
        ring: '#FF6A00',
        background: '#FAFAFA',
        foreground: '#111111',
      },
      backgroundImage: {
        // Gradient Combos
        'gradient-sunrise': 'linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)',
        'gradient-warm-peach': 'linear-gradient(90deg, #FF8A33 0%, #FFB38A 100%)',
        'gradient-deep-ember': 'linear-gradient(120deg, #E65100 0%, #FF6A00 60%, #FFD3A3 100%)',
        'gradient-tangerine': 'linear-gradient(180deg, #FF6A00 10%, #FF8A33 50%, #FFB38A 100%)',
        'gradient-sunset-violet': 'linear-gradient(90deg, #FF6A00 0%, #FF8A33 50%, #8E44AD 100%)',
        'gradient-soft-glow': 'linear-gradient(180deg, rgba(255,106,0,0.12), rgba(255,179,138,0.04))',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'orange-sm': '0 1px 2px 0 rgba(255, 106, 0, 0.05)',
        'orange-md': '0 4px 6px -1px rgba(255, 106, 0, 0.1), 0 2px 4px -1px rgba(255, 106, 0, 0.06)',
        'orange-lg': '0 10px 15px -3px rgba(255, 106, 0, 0.1), 0 4px 6px -2px rgba(255, 106, 0, 0.05)',
        'orange-xl': '0 20px 25px -5px rgba(255, 106, 0, 0.1), 0 10px 10px -5px rgba(255, 106, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-orange': 'pulseOrange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseOrange: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
    },
  },
  plugins: [],
}

export default config
