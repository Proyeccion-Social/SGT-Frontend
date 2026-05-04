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
  fonts: [
    {
      name: "Cabinet Grotesk Variable",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ["./assets/fonts/CabinetGrotesk-Variable.ttf"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
    {
      name: "Caveat",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ["./assets/fonts/Caveat-Regular.ttf"],
            weight: "400",
            style: "normal",
          },
        ],
      },
    },
    {
      name: "Open Sauce Two",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ["./assets/fonts/sans/OpenSauceSans-Light.ttf"],
            weight: "300",
            style: "normal",
          },
          {
            src: ["./assets/fonts/sans/OpenSauceSans-Regular.ttf"],
            weight: "400",
            style: "normal",
          },
          {
            src: ["./assets/fonts/sans/OpenSauceSans-Medium.ttf"],
            weight: "500",
            style: "normal",
          },
          {
            src: ["./assets/fonts/sans/OpenSauceSans-SemiBold.ttf"],
            weight: "600",
            style: "normal",
          },
          {
            src: ["./assets/fonts/sans/OpenSauceSans-Bold.ttf"],
            weight: "700",
            style: "normal",
          },
          {
            src: ["./assets/fonts/sans/OpenSauceSans-ExtraBold.ttf"],
            weight: "800",
            style: "normal",
          },
          {
            src: ["./assets/fonts/sans/OpenSauceSans-Black.ttf"],
            weight: "900",
            style: "normal",
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
