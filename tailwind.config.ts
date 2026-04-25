/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,html}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [],
};