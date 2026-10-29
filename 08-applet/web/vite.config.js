import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Relative base, so the built site works under any GitHub Pages path a fork publishes to.
export default defineConfig({
  base: "./",
  plugins: [svelte()],
});
