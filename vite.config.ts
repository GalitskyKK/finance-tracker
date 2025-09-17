import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { visualizer } from "rollup-plugin-visualizer"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt", // Изменили на prompt для принудительного обновления
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "KashKontrol - Finance Tracker",
        short_name: "KashKontrol",
        description: "Личный трекер финансов для управления доходами и расходами",
        theme_color: "#3b82f6",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        id: "/",
        categories: ["finance", "productivity", "utilities"],
        icons: [
          {
            src: "icon-72x72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "icon-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "icon-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "icon-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        screenshots: [
          {
            src: "screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Dashboard view on desktop"
          },
          {
            src: "screenshot-narrow.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Mobile dashboard view"
          }
        ]
      },
      workbox: {
        skipWaiting: true, // Принудительное обновление
        clientsClaim: true, // Немедленное управление страницами
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 год
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: "module"
      }
    }),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "query-vendor": ["@tanstack/react-query"],
          "chart-vendor": ["recharts"],
          "form-vendor": ["react-hook-form"],
          "date-vendor": ["date-fns"],
          "icon-vendor": ["lucide-react"],
          "store-vendor": ["zustand"]
        }
      }
    },
    // Увеличиваем лимит для chunk warning
    chunkSizeWarningLimit: 1000,
    // Минификация
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false, // ВКЛЮЧАЕМ console.log для диагностики!
        drop_debugger: true
      }
    }
  }
})
