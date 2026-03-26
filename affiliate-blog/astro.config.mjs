// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { rehypeAmazonAffiliate } from './src/plugins/rehype-amazon-affiliate.mjs';

// https://astro.build/config
const env = loadEnv(
  process.env.NODE_ENV === 'production' ? 'production' : 'development',
  process.cwd(),
  '',
);
const associateTag =
  env.AMAZON_ASSOCIATE_TAG || process.env.AMAZON_ASSOCIATE_TAG || '';
const marketplace =
  env.AMAZON_MARKETPLACE || process.env.AMAZON_MARKETPLACE || 'www.amazon.co.jp';

export default defineConfig({
  site:
    process.env.SITE_URL ||
    env.SITE_URL ||
    'https://amazon-affiliate-blog.vercel.app',
  integrations: [
    react(),
    mdx({
      rehypePlugins: [
        [rehypeAmazonAffiliate, { associateTag, marketplace }],
      ],
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});