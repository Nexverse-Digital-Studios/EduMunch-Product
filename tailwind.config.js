/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors (VS Code / GitHub Dark)
        dark: {
          bg: {
            primary: '#1e1e1e',
            secondary: '#252526',
            tertiary: '#2d2d30',
            elevated: '#3e3e42',
          },
          surface: {
            primary: '#2d2d30',
            secondary: '#3e3e42',
            tertiary: '#404040',
          },
          border: {
            primary: '#454545',
            secondary: '#3e3e42',
          },
          text: {
            primary: '#cccccc',
            secondary: '#969696',
            tertiary: '#6a6a6a',
          },
        },
        // Primary brand color (blue/indigo from reference)
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Card colors matching the reference exactly
        card: {
          blue: {
            bg: '#EBF5FF',
            text: '#1E40AF',
            icon: '#3B82F6',
          },
          green: {
            bg: '#ECFDF5',
            text: '#059669',
            icon: '#10B981',
          },
          purple: {
            bg: '#F5F3FF',
            text: '#7C3AED',
            icon: '#8B5CF6',
          },
          orange: {
            bg: '#FFF7ED',
            text: '#EA580C',
            icon: '#F97316',
            border: '#FDBA74',
          },
          red: {
            bg: '#FEF2F2',
            text: '#DC2626',
            icon: '#EF4444',
          },
          yellow: {
            bg: '#FFFBEB',
            text: '#CA8A04',
            icon: '#EAB308',
          },
          teal: {
            bg: '#F0FDFA',
            text: '#0D9488',
            icon: '#14B8A6',
          },
        },
        // Sidebar colors
        sidebar: {
          bg: '#FFFFFF',
          active: '#EEF2FF',
          hover: '#F5F5F5',
          text: '#374151',
          activeText: '#4F46E5',
        },
      },
      fontSize: {
        'stat-value': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'stat-label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
