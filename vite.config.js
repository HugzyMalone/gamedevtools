import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

const routes = [
  '/',
  '/tools/loot-table-simulator',
  '/tools/damage-formula-sandbox',
  '/tools/xp-curve-designer',
  '/tools/palette-generator',
  '/tools/game-jam-ideas',
  '/tools/sprite-sheet-slicer',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://www.gamedevtools.dev',
      dynamicRoutes: routes,
    }),
  ],
})
