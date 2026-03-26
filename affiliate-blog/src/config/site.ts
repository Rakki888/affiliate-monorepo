export const SITE = {
  name: 'Amazon おすすめナビ',
  description: '実際に使って本当に良かった商品だけを厳選して紹介するブログです。',
  url: import.meta.env.SITE_URL || 'https://example.com',
  author: 'サイト管理者',
  lang: 'ja',
  locale: 'ja_JP',
} as const;

export interface CategoryDef {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: 'gadget', name: 'ガジェット・家電', description: 'スマホ、PC、イヤホンなどのガジェット・家電レビュー' },
  { slug: 'book', name: '書籍・Kindle', description: 'おすすめの本やKindle書籍の紹介' },
  { slug: 'beauty', name: '美容・コスメ', description: '美容グッズやコスメのレビュー' },
  { slug: 'food', name: '食品・グルメ', description: 'おすすめ食品やグルメの紹介' },
  { slug: 'hobby', name: '趣味・ホビー', description: '趣味やホビー関連グッズの紹介' },
  { slug: 'life', name: '生活・日用品', description: '暮らしを便利にする日用品の紹介' },
];

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', href: '/' },
  ...CATEGORIES.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
  { label: 'サイトについて', href: '/about' },
];

export const POSTS_PER_PAGE = 12;
