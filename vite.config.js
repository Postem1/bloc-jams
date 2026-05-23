import { defineConfig } from 'vite';

// Multi-page app: every HTML file at the project root is its own
// entry point. Vite's dev server (`npm run dev`) serves them all
// automatically; this config is what teaches `vite build` to emit
// production bundles for each one.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: 'index.html',
        collection: 'collection.html',
        album: 'album.html'
      }
    }
  }
});
