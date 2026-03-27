import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icons/apple-touch-icon.png", "images/**/*"],
      manifest: {
        name: "Repentance & Holiness",
        short_name: "R&H",
        description: "Repentance and Holiness ministry app with live radio.",
        theme_color: "#060614",
        background_color: "#060614",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/images/net-error.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,gif}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // Cache API responses with network-first strategy
          {
            urlPattern: /^https?:\/\/localhost.*\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache all images including external sources
          {
            urlPattern: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache external resources with cache-first strategy
          {
            urlPattern: /^https:\/\/.*$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "http-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
