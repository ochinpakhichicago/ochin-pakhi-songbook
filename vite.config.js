import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/tts': {
        target: 'https://translate.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => {
          const q = new URLSearchParams(path.split('?')[1] || '').get('q') || '';
          return `/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=bn&client=gtx&sl=bn&ttsspeed=0.8`;
        },
        headers: {
          'Referer': 'https://translate.google.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
})
