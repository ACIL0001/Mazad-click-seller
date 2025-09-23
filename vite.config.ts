import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  base: process.env.NODE_ENV === 'production' ? '/' : '/seller/',
  server: {
    port: 3002,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  json: {
    stringify: true,
  },
});
