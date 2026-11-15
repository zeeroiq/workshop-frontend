import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-widget-bundle',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url === '/widget/widget.js' || req.url.startsWith('/widget/widget.js?'))) {
            const publicWidget = path.resolve(__dirname, 'public/widget/widget.js');
            const distWidget = path.resolve(__dirname, 'dist/widget/widget.js');
            const fileToServe = fs.existsSync(publicWidget) ? publicWidget : (fs.existsSync(distWidget) ? distWidget : null);
            if (fileToServe) {
              res.setHeader('Content-Type', 'application/javascript');
              return fs.createReadStream(fileToServe).pipe(res);
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
