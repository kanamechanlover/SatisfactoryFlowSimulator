import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  base: process.env.NODE_ENV === "production" ? "/SatisfactoryFlowSimulator/" : "./",
  resolve: {
    extensions: [
      '.ts',
      '.js',
      'vue',
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
  ],
})
