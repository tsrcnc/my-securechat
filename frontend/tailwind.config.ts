import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    50: '#f3e8ff',
                    100: '#e9d5ff',
                    200: '#d8b4fe',
                    300: '#c084fc',
                    400: '#a855f7',
                    500: '#8b5cf6', // Primary Purple
                    600: '#7c3aed',
                    700: '#6200EE', // The specific color from the image
                    800: '#5b21b6',
                    900: '#4c1d95',
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                heading: ['var(--font-poppins)', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
