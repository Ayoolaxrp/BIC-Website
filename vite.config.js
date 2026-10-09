import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

import { reticle } from '@reticlehq/vite-plugin';

// One switch for every absolute URL (canonical, social cards, robots,
// sitemap).
// The club's domain is babcockinvestorsclub.com; the apex redirects to www,
// so www is the canonical host. Override with VITE_SITE_URL if that changes.
const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.babcockinvestorsclub.com').replace(/\/+$/, '');
const PUBLIC_ROUTES = ['/', '/about', '/membership', '/events', '/blog', '/sponsorship', '/contact', '/privacy', '/terms'];

function siteUrl() {
  return {
    name: 'bic-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /member', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''];
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') });
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...PUBLIC_ROUTES.map((r) => `  <url><loc>${SITE_URL}${r}</loc></url>`),
        '</urlset>',
        '',
      ];
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap.join('\n') });
    },
  };
}

export default defineConfig({
  plugins: [reticle(), react(), siteUrl()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // SPA fallback for GitHub Pages: unknown paths serve the app shell.
        '404': fileURLToPath(new URL('./404.html', import.meta.url)),
      },
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom|scheduler)/ },
            { name: 'router', test: /node_modules\/(react-router|@remix-run)/ },
            { name: 'motion', test: /node_modules\/framer-motion/ },
            { name: 'supabase', test: /node_modules\/@supabase/ }
          ]
        }
      }
    }
  }
});
