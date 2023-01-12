import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  base: './',
  resolve: {
    extensions: [
      '.ts',
      '.js',
    ],
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },
  build: { // ビルド時の設定
    outDir: './docs', // 出力先のパス
    assetsDir: '.', // アセットデータ生成パス（outDir からの相対パス）
    emptyOutDir: true, // ビルド時に出力先をクリア
  },
  publicDir: './public', // 静的アセットの場所
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.indexOf('-') !== -1
        },
      },
    }),
    Components({ /* options */ }),
    svgLoader({
      defaultImport: 'url'
    }),
  ],
})
