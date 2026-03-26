import fs from 'node:fs';
import path from 'node:path';
import type { Product, ProductCache, ProductCacheEntry } from '../types/product';

const CACHE_DIR = path.resolve(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'products.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadCache(): ProductCache {
  ensureCacheDir();
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(raw) as ProductCache;
  } catch {
    console.warn('[cache] Failed to parse cache file, starting fresh');
    return {};
  }
}

function saveCache(cache: ProductCache): void {
  ensureCacheDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

export function isCacheValid(asin: string): boolean {
  const cache = loadCache();
  const entry = cache[asin];
  if (!entry) return false;
  return new Date(entry.expiresAt).getTime() > Date.now();
}

export function getCachedProduct(asin: string): Product | null {
  const cache = loadCache();
  const entry = cache[asin];
  if (!entry) return null;
  if (new Date(entry.expiresAt).getTime() > Date.now()) {
    return entry.product;
  }
  return null;
}

export function getExpiredCachedProduct(asin: string): Product | null {
  const cache = loadCache();
  const entry = cache[asin];
  return entry?.product ?? null;
}

export function setCachedProduct(asin: string, product: Product): void {
  const cache = loadCache();
  const now = new Date();
  const entry: ProductCacheEntry = {
    product,
    cachedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
  };
  cache[asin] = entry;
  saveCache(cache);
}

export function clearExpiredCache(): void {
  const cache = loadCache();
  const now = Date.now();
  let changed = false;
  for (const asin of Object.keys(cache)) {
    if (new Date(cache[asin].expiresAt).getTime() <= now) {
      delete cache[asin];
      changed = true;
    }
  }
  if (changed) saveCache(cache);
}
