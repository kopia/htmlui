import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react()],
    server: {
        port: 3000,
        host: 'localhost',
        https: false,
        strictPort: true,
        open: true,
        proxy: {
          '/api': {
            target: 'http://localhost:51515',
            changeOrigin: true,
            secure: false,
          },
        },
    },
  };
});
