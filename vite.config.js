import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  // Add this for Vercel deployment
  build: {
    outDir: 'dist',
    sourcemap: false,
     css: {
      devSourcemap: false
    }
  },
  // Ensure Vite serves the app correctly
  base: './'
});