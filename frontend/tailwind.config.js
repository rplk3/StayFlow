/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#1E3A8A',
                secondary: '#3B82F6',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                background: '#F3F4F6',
                cards: '#FFFFFF',
                text: '#111827',
                muted: '#6B7280',
                refunded: '#8B5CF6'
            },
            boxShadow: {
                'soft': '0 4px 10px rgba(0,0,0,0.05)',
            }
        },
    },
    plugins: [],
}
