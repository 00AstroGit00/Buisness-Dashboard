import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Deepa Hotel Management Dashboard',
        short_name: 'Deepa',
        description: 'Professional management dashboard for Deepa Restaurant & Tourist Home',
        theme_color: '#0a3d31', // Forest Green
        background_color: '#ffffff', // White
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'assets/images/logo-with-branding.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/images/logo-with-branding.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  clearScreen: false, // Prevent Vite from clearing the terminal screen
  server: {
    host: true, // Expose to local network for mobile access
    port: 5173,
    strictPort: false,
    // Automatically open network URL in console
    open: false,
    watch: {
      ignored: ['**/Buisiness-Branding-Elements/**'],
    },
    fs: { // Added
      allow: [__dirname], // Added: Allow serving files from the root directory
    },
  },
  build: {
    // Optimize for fast initial load (< 1.5s on Samsung S23 Ultra)
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove comments
      },
    },
    // Code splitting and chunking
    rollupOptions: {
      external: [
        /\/Buisiness-Branding-Elements\//,
      ],
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'], // Individual chunk for tree-shaking optimization
          'chart-vendor': ['recharts'], // Separate chunk for heavy chart logic
          'utils-vendor': ['xlsx', 'file-saver'],
          'state-vendor': ['zustand'],
          // Feature chunks
          'inventory': [
            './src/components/Inventory.tsx',
            './src/components/InventoryRow.tsx',
            './src/utils/liquorLogic.ts',
          ],
          'accounting': [
            './src/components/Accounting.tsx',
            './src/utils/reportExporter.ts',
            './src/utils/endOfDayExporter.ts',
          ],
          'analytics': [
            './src/components/ProfitAnalytics.tsx',
            './src/components/DashboardOverview.tsx',
          ],
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name || '')) {
            return 'images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    // Source maps for production debugging (optional - disable for smaller bundle)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Report compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    entries: ['index.html', 'src/main.tsx'],
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'zustand',
      'recharts',
    ],
    exclude: ['liquorCalculator.worker.ts', 'Buisiness-Branding-Elements'], // Exclude workers from optimization
    force: true, // Added: Force dependency pre-bundling
  },
})