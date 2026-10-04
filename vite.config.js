import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative base so the build works on GitHub Pages under any repo name.
  base: "./",
  plugins: [react(), tailwindcss()],
  worker: { format: "es" },
  test: {
    testTimeout: 120000,
    hookTimeout: 300000,
  },
});
