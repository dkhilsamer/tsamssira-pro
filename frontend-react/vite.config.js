import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: ['styled-jsx/babel'],
            },
        }),
    ],
    base: '/',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('lucide-react')) return 'vendor-lucide';
                        if (id.includes('leaflet')) return 'vendor-leaflet';
                        if (id.includes('framer-motion')) return 'vendor-framer';
                        return 'vendor';
                    }
                }
            }
        }
    },
});
