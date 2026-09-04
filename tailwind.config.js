/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: { 50: '#E6F0E9', 300: '#5FBC8B', 600: '#0E6B45', 700: '#0A5637' },
        accent: { 50: '#FBEFD6', 500: '#E8A317', 950: '#2A1D02' },
        ocean: { 400: '#4FA3E8', 600: '#1462A8' },
        sand: { 50: '#FBF7F0', 100: '#F3EEE4', 200: '#E4DCCB', 300: '#DDD5C6' },
        ink: {
          300: '#9A9484',
          400: '#8A8474',
          500: '#5B655E',
          600: '#4C5650',
          700: '#3A443E',
          900: '#16211C',
        },
        night: { 500: '#333B34', 600: '#2C332D', 700: '#232B24', 800: '#19201C', 900: '#101512' },
        mist: { 50: '#E7EDE8', 200: '#C3CCC5', 400: '#9AA79E', 500: '#7C8A80' },
        traffic: {
          1: '#2FA84F',
          2: '#F2C230',
          3: '#F07C1E',
          4: '#DC3B2F',
          '1-dark': '#46C46A',
          '2-dark': '#FFD34F',
          '3-dark': '#FF9440',
          '4-dark': '#F2564A',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sheet: '28px', card: '20px', field: '14px', btn: '17px' },
    },
  },
  plugins: [],
}
