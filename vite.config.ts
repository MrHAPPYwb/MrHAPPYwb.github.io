import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const appBase = process.env.GITHUB_PAGES === 'true' ? '/rainbow-quest-island/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base: appBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: '彩虹任务岛',
        short_name: '任务岛',
        description: '一年级语文、数学、英语的每日学习小游戏',
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
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
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
