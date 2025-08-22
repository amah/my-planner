/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/index.html',
    './apps/**/*.{ts,tsx,js,jsx,html}',
    './libs/**/*.{ts,tsx,js,jsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
