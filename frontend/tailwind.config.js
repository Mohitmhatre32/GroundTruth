/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#027598',     // Deep Soft Teal-Blue (Headers/Nav/Active States)
          secondary: '#dbb432',   // Dark Mustard Yellow (Highlights/Accents)
          background: '#F3F5F7',  // Soft Grey (Global Background)
          surface: '#FFFFFF',     // Cards / Panels / Modals
          textMain: '#243A40',    // Main Headings
          textMuted: '#6B7C83',   // Subtitles / Meta data
          success: '#6FAF8F',     // Safe Zone / Verified
          warning: '#B28B1E',     // Semi-Critical Zone
          danger: '#C96A6A',      // Critical Zone / Alerts
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'], // Use for clean readability
        },
        animation: {
          'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite', // For Live Badges
        }
      }
    },
    plugins: [],
  }
