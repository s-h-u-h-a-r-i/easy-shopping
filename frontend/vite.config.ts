import { resolve } from 'path';
import devtools from 'solid-devtools/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(() => {
  return {
    plugins: [
      devtools(),
      solidPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        manifest: {
          name: 'Easy Shopping',
          short_name: 'Shopping',
          start_url: '/',
          display: 'standalone',
          background_color: '#0a0a0a',
          theme_color: '#0a0a0a',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        devOptions: {
          enabled: true,
          navigateFallback: '/',
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
    },
    build: {
      target: 'esnext',
    },
  };
});
