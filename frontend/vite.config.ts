import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'logo-mark.svg', 'logo-full.svg', 'logo-mono.svg', 'offline.html', 'icons/*.png', 'og-image.png'],
      manifest: {
        name: 'VYNTRIXA — AI-Powered Adaptive Learning Intelligence',
        short_name: 'Vyntrixa',
        description: 'AI-Powered Adaptive Learning Intelligence (Offline-First)',
        theme_color: '#4F46E5',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            url: '/dashboard',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Roadmap',
            short_name: 'Roadmap',
            url: '/roadmap',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Assessment',
            short_name: 'Assessment',
            url: '/assessments',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/docs/, /^\/openapi.json/],
        runtimeCaching: [
          // Static assets and Google Fonts: CacheFirst, 1 year
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vyntrixa-fonts-v1',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vyntrixa-static-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // GET /api/roles, /api/skills, /api/resources: StaleWhileRevalidate
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (url.pathname.startsWith('/api/roles') ||
               url.pathname.startsWith('/api/skills') ||
               url.pathname.startsWith('/api/resources')),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vyntrixa-catalogs-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // GET /api/roadmap, /api/progress, /api/profile: NetworkFirst with 3s timeout
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (url.pathname.startsWith('/api/roadmap') ||
               url.pathname.startsWith('/api/progress') ||
               url.pathname.startsWith('/api/profile') ||
               url.pathname.startsWith('/api/analysis') ||
               url.pathname.startsWith('/api/match')),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vyntrixa-runtime-v1',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
