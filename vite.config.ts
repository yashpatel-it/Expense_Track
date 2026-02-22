import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR control
      hmr: process.env.DISABLE_HMR !== 'true',

      // Allow Render domain
      allowedHosts: ['expense-track-z9xr.onrender.com'],
      
      // If you want to allow all hosts instead, use:
      // allowedHosts: true,
    },
  };
});
