import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        shine: "shine 2s linear infinite", // Đảm bảo hoạt ảnh chạy liên tục với thời gian tuyến tính
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "200% 0%" },
          "100%": { backgroundPosition: "-200% 0%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
