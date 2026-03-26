import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    image: z.string().optional(),
    /** 記事末尾に商品カードを自動表示（ASIN または Amazon 商品URL の配列） */
    amazonAsins: z.array(z.string()).optional(),
    /**
     * PA-API SearchItems でキーワード検索し、ヒットした商品をカード表示（要 API キー）
     * `amazonSearchUseTags` と併用可（先に explicit キーワード、続けてタグ）
     */
    amazonSearchKeywords: z.array(z.string()).optional(),
    /** true のとき `tags` を検索キーワードとしても使う（最大件数は amazon-api 側で制限） */
    amazonSearchUseTags: z.boolean().optional(),
    /** PA-API の SearchIndex（例: Books, Electronics）。未指定はカテゴリ横断検索 */
    amazonSearchIndex: z.string().optional(),
    /** キーワード1つあたり採用する件数（1〜5） */
    amazonSearchMaxPerKeyword: z.number().int().min(1).max(5).optional().default(1),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
