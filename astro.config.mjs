import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

export default defineConfig({
  output: 'server',
  adapter: isVercel ? vercel({ imageService: true }) : node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
