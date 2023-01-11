import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  resolve: {
    extensions: [
      '.ts',
      '.js'
    ],
    alias: {
      '@': path.join(__dirname, 'src'),
    }
  },
  build: {
    outDir: './docs'
  },
  publicDir: 'assets',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.indexOf('-') !== -1
        }
      }
    }),
    Components({ /* options */ }),
    svgLoader({
      defaultImport: 'url'
    })
  ],
})
