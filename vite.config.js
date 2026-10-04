import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; CI sets BASE_PATH accordingly.
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  worker: { format: "es" },
  test: {
    testTimeout: 120000,
    hookTimeout: 300000,
  },
});
