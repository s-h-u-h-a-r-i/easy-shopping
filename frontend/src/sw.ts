/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(import.meta.env.PROD ? self.__WB_MANIFEST : []);

registerRoute(
  ({ url }) => url.origin === import.meta.env.VITE_SUPABASE_URL,
  new NetworkFirst({
    cacheName: 'supabase-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => request.url,
        cachedResponseWillBeUsed: async ({ cachedResponse }) => cachedResponse,
      },
    ],
  }),
);
