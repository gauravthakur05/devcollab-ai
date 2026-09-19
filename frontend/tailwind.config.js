/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#0B0D12',
        surface: '#12151C',
        surface2: '#171B24',
        border: '#232836',
        muted: '#8B93A7',
        ink: '#E6E8EC',
        accent: {
          DEFAULT: '#6E56CF',
          hover: '#7E68D9',
          soft: 'rgba(110,86,207,0.15)',
        },
        mint: {
          DEFAULT: '#22D3AA',
          soft: 'rgba(34,211,170,0.15)',
        },
        warn: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
