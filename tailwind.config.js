/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sorasemibold: ["SoraSemiBold", "sans-serif"],
        sorabold: ["SoraBold", "sans-serif"],
        soraextralight: ["SoraExtraLight", "sans-serif"],
        soralight: ["SoraLight", "sans-serif"],
        soraregular: ["SoraRegular", "sans-serif"],
        soramedium: ["SoraMedium", "sans-serif"],
      },
    },
  },
  plugins: [],
};
