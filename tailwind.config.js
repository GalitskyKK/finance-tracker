/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        neutral: 'var(--neutral)',
        background: 'var(--background)',
        card: 'var(--card)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
};
