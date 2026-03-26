import type { CollectionEntry } from 'astro:content';

export interface SearchItem {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
}

export function buildSearchIndex(
  posts: CollectionEntry<'blog'>[],
): SearchItem[] {
  return posts
    .filter((p) => !p.data.draft)
    .map((p) => ({
      title: p.data.title,
      description: p.data.description,
      slug: p.id,
      category: p.data.category,
      tags: p.data.tags,
    }));
}
