/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#003580', // Booking.com Dark Blue
                secondary: '#0071c2', // Booking.com Light Blue
                accent: '#feba02', // Booking.com Yellow
                danger: '#d33', // Booking.com Red / Danger
                background: '#f5f5f5', // Light gray background
                card: '#ffffff',
                textPrimary: '#262626',
                textSecondary: '#6b6b6b',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 10px rgba(0,0,0,0.05)',
            },
            borderRadius: {
                'xl': '12px',
            }
        },
    },
    plugins: [],
}
