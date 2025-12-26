import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    base: '/magic-english-buddy/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'robots.txt',
          'apple-touch-icon.png',
          'animations/*.json',
          'sounds/*.mp3',
          'images/**/*.webp'
        ],
        manifest: {
          name: 'Magic English Buddy',
          short_name: 'MagicBuddy',
          description: '你的魔法英语伙伴 - 离线英语学习应用',
          theme_color: '#6B5CE7',
          background_color: '#1A1A2E',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/magic-english-buddy/',
          scope: '/magic-english-buddy/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          categories: ['education', 'kids'],
          lang: 'zh-CN'
        },
        workbox: {
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,json,woff,woff2}'
          ],
          runtimeCaching: [
            {
              // 故事 JSON 数据 - 缓存优先
              urlPattern: /\/data\/stories\/.+\.json$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'stories-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
                }
              }
            },
            {
              // 音频文件 - 缓存优先
              urlPattern: /\/audio\/.+\.(mp3|ogg|wav)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Lottie 动画 - 缓存优先
              urlPattern: /\/animations\/.+\.json$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'animations-cache',
                expiration: {
                  maxEntries: 50
                }
              }
            },
            {
              // 图片资源 - 缓存优先
              urlPattern: /\.(png|jpg|jpeg|webp|gif|svg)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-animation': ['framer-motion', 'lottie-react'],
            'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
            'vendor-storage': ['dexie', 'zustand', 'immer'],
            'vendor-state': ['xstate', '@xstate/react']
          }
        }
      },
      chunkSizeWarningLimit: 500
    }
  };
});
