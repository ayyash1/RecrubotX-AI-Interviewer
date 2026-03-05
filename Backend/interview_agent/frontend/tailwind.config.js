/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#eaeeff',
                    100: '#dce1ff',
                    200: '#c2c9ff',
                    300: '#9ba5ff',
                    400: '#717aff',
                    500: '#484aff',
                    600: '#2c22ff',
                    700: '#1e13eb',
                    800: '#1810c0',
                    900: '#181296', // Deep Indigo/Blue as primary
                    950: '#0e0b57',
                },
                surface: {
                    50: '#f8fafc', // Main background
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a', // Dark mode background
                    950: '#020617',
                },
                accent: {
                    light: '#60a5fa', // Electric Blue
                    DEFAULT: '#3b82f6',
                    dark: '#2563eb',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
