export interface ProductPrice {
  amount: number;
  currency: string;
  displayAmount: string;
}

export interface ProductRating {
  value: number;
  count: number;
}

export interface Product {
  asin: string;
  title: string;
  url: string;
  imageUrl: string;
  price: ProductPrice | null;
  originalPrice: ProductPrice | null;
  rating: ProductRating | null;
  features: string[];
  brand: string | null;
  fetchedAt: string;
}

export interface ProductCacheEntry {
  product: Product;
  cachedAt: string;
  expiresAt: string;
}

export interface ProductCache {
  [asin: string]: ProductCacheEntry;
}

export interface RankingItem {
  asin: string;
  comment: string;
  pros?: string[];
  cons?: string[];
}
