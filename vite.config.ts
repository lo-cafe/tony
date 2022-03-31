import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const path = require('path');
import htmlPlugin from 'vite-plugin-html-config';


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    htmlPlugin({
      links: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://tony.tallstranger.studio/assets/apple-touch-icon.png' },
        { rel: 'icon', sizes: '32x32', href: 'https://tony.tallstranger.studio/assets/favicon-32x32.png' },
        { rel: 'icon', sizes: '16x16', href: 'https://tony.tallstranger.studio/assets/favicon-16x16.png' },
        { rel: 'manifest', href: 'https://tony.tallstranger.studio/assets/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOriginIsolated: true },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;600&family=Open+Sans:wght@400;500;600&family=Roboto+Condensed:ital,wght@1,300&family=Roboto+Mono:wght@400;600&family=Nunito:wght@400;500;700&display=swapdisplay=swap',
        },
      ],
      metas: [
        { name: 'title', content: 'Tony - Visual Novels' },
        { name: 'description', content: 'Tony is a visual novel writing app.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://tony.tallstranger.studio' },
        { property: 'og:title', content: 'Tony - Visual Novels' },
        { property: 'og:description', content: 'Tony is a visual novel writing app.' },
        { property: 'og:image', content: 'https://tony.tallstranger.studio/assets/cover.png' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://tony.tallstranger.studio' },
        { property: 'twitter:title', content: 'Tony - Visual Novels' },
        { property: 'twitter:description', content: 'Tony is a visual novel writing app.' },
        { property: 'twitter:image', content: 'https://tony.tallstranger.studio/assets/cover.png' },
        { property: 'twitter:image', content: 'https://tony.tallstranger.studio/assets/cover.png' },
        { property: 'twitter:image', content: 'https://tony.tallstranger.studio/assets/cover.png' },
        { property: 'twitter:image', content: 'https://tony.tallstranger.studio/assets/cover.png' },
      ],
    }),
  ],
});
