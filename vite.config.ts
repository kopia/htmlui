import type { PluginOption } from 'vite';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const kopiaVersionInformation = (): PluginOption => ({
  config: (config, env) => {
    if (!config.define) {
      config.define = {};
    }

    config.define.REACT_APP_FULL_VERSION_INFO = JSON.stringify(process.env.REACT_APP_FULL_VERSION_INFO);
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), kopiaVersionInformation()],
  server: {
    cors: true,
    proxy: {
      "/api": "http://127.0.0.1:51515"
    }
  },
  test: {
    environment: 'jsdom'
  }
})
