import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from 'path';

export default defineConfig({
    plugins: [react(), cssInjectedByJsPlugin()],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), 'src'),
        },
    },
    build: {
        outDir: 'dist/widget',
        lib: {
            entry: path.resolve(__dirname, 'src/widget/main.jsx'),
            name: 'SiteIQWidget',
            fileName: () => 'widget.js',
            formats: ['umd']
        },
        rollupOptions: {
            // we bundle react inside the widget so it's fully standalone
            external: [],
            output: {
                globals: {}
            }
        },
        // We define process.env so React doesn't crash when bundled
        define: {
            'process.env.NODE_ENV': '"production"'
        }
    }
});
