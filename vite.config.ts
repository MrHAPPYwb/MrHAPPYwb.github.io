import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const appBase =
  process.env.PWA_BASE ??
  (process.env.GITHUB_PAGES === 'true' ? '/rainbow-quest-island/' : '/')

// https://vite.dev/config/
export default defineConfig({
  base: appBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: '研姐的水晶矿山',
        short_name: '研姐水晶矿',
        description: '黄金矿工玩法的一年级语文、数学、英语 100 关学习游戏',
        start_url: appBase,
        scope: appBase,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#150f2a',
        theme_color: '#48266d',
        icons: [
          {
            src: `${appBase}pwa-icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json}'],
        importScripts: ['sw-refresh.js'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
