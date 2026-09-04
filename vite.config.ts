import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Manifest + Workbox caching strategies (icônes, CacheFirst/NetworkFirst — CLAUDE.md §10) : étape 7.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Lib'Trafic",
        short_name: "Lib'Trafic",
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#FBF7F0',
        theme_color: '#0E6B45',
        icons: [],
      },
    }),
  ],
})
