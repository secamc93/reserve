// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// rupü.com en punycode: las URL canónicas y el sitemap deben ir en ASCII.
export default defineConfig({
  site: 'https://xn--rup-joa.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 1,
    }),
  ],
  vite: {
    // @tailwindcss/vite trae tipos de Vite 7 y Astro 5 usa Vite 6: funciona igual, solo choca el tipado.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
