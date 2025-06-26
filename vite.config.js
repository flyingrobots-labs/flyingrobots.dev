import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    sourcemap: true,
  },
  server: {
    port: 1337,
    open: true,
  },
});