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
      // favicon: './logo.svg',
      links: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOriginIsolated: true },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;600&display=swap',
        },
      ],
      metas: [
        { name: 'title', content: 'The Old Man - Visual Novels' },
        { name: 'description', content: 'The Old Man is a visual novel writing app.' },
        { name: 'og:type', content: 'website' },
        { name: 'og:url', content: 'https://the-old-man.vercel.app' },
        { name: 'og:title', content: 'The Old Man - Visual Novels' },
        { name: 'og:description', content: 'The Old Man is a visual novel writing app.' },
        { name: 'og:image', content: 'https://the-old-man.vercel.app/assets/cover.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://the-old-man.vercel.app' },
        { name: 'twitter:title', content: 'The Old Man - Visual Novels' },
        { name: 'twitter:description', content: 'The Old Man is a visual novel writing app.' },
        { name: 'twitter:image', content: 'https://the-old-man.vercel.app/assets/cover.png' },
        { name: 'twitter:image', content: 'https://the-old-man.vercel.app/assets/cover.png' },
        { name: 'twitter:image', content: 'https://the-old-man.vercel.app/assets/cover.png' },
        { name: 'twitter:image', content: 'https://the-old-man.vercel.app/assets/cover.png' },
      ],
    }),
  ],
});
