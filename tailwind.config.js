/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [
    require('@digital-go-jp/tailwind-theme-plugin'),
    require('@tailwindcss/container-queries'),
  ],
}
