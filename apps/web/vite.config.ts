import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: true
  }
});
