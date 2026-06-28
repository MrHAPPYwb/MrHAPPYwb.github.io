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
        name: '研姐的宝石任务岛',
        short_name: '研姐任务岛',
        description: '一年级语文数学、低年级英语、绘画与宝石制造沉浸式学习游戏',
        start_url: appBase,
        scope: appBase,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fcff',
        theme_color: '#0f766e',
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
        globIgnores: ['**/rainbow-quest-world.png'],
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
