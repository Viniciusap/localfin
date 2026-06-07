import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3333';
  const base        = env.VITE_BASE || '/';

  return {
    base,
    plugins: [react()],
    server: {
      allowedHosts: true,
      open: !process.env.CI,
      proxy: {
        '/api': proxyTarget,
      },
    },
  };
});
