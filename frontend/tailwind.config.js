const c = (n) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { bg: c("bg"), surface: c("surface"), ink: c("ink"), muted: c("muted"), line: c("line"), primary: c("primary"), onprimary: c("on-primary"), forest: c("forest"), sage: c("sage"), gold: c("gold"), champagne: c("champagne") },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"], serif: ["var(--font-serif)", "Georgia", "serif"] },
      boxShadow: { soft: "0 18px 50px -20px rgb(var(--shadow) / .35)", gold: "0 0 0 1px rgb(var(--gold) / .4), 0 14px 40px -18px rgb(var(--gold) / .55)" },
    },
  },
  plugins: [],
};
