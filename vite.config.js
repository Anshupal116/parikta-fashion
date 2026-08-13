import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
  registerType: "autoUpdate",

  manifest: {
    name: "Parikta Fashion",
    short_name: "Parikta",
    description:
      "Parikta Fashion - Premium designer wear and custom outfits.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",

    theme_color: "#9A3F4D",
    background_color: "#fffaf7",

    icons: [
      {
        src: "/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },

  workbox: {
    navigateFallback: "/index.html",

    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  },
}),
  ],
});