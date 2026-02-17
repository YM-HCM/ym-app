'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA functionality.
 * Helps iOS Safari treat the app as a "real" PWA in standalone mode.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(() => {
          // Service worker registered successfully
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
