import crypto from 'node:crypto';
import {
  getCachedProduct,
  getExpiredCachedProduct,
  setCachedProduct,
} from './cache';
import type { Product } from '../types/product';

// --- Config ---

const ACCESS_KEY = import.meta.env.AMAZON_ACCESS_KEY ?? '';
const SECRET_KEY = import.meta.env.AMAZON_SECRET_KEY ?? '';
const ASSOCIATE_TAG = import.meta.env.AMAZON_ASSOCIATE_TAG ?? '';
const MARKETPLACE =
  import.meta.env.AMAZON_MARKETPLACE ?? 'www.amazon.co.jp';

const HOST = 'webservices.amazon.co.jp';
const REGION = 'us-west-2';
const SERVICE = 'ProductAdvertisingAPI';

const ITEM_RESOURCES = [
  'Images.Primary.Large',
  'ItemInfo.Title',
  'ItemInfo.Features',
  'ItemInfo.ByLineInfo',
  'Offers.Listings.Price',
  'Offers.Listings.SavingBasis',
  'CustomerReviews.StarRating',
  'CustomerReviews.Count',
];

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

let lastRequestTime = 0;

// --- AWS Signature V4 ---

function hmacSHA256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf-8').digest();
}

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf-8').digest('hex');
}

function getSignatureKey(
  key: string,
  dateStamp: string,
  region: string,
  service: string,
): Buffer {
  const kDate = hmacSHA256(`AWS4${key}`, dateStamp);
  const kRegion = hmacSHA256(kDate, region);
  const kService = hmacSHA256(kRegion, service);
  return hmacSHA256(kService, 'aws4_request');
}

interface SignedHeaders {
  [key: string]: string;
}

function signRequest(
  operation: string,
  payload: string,
  amzDate: string,
  dateStamp: string,
): SignedHeaders {
  const contentType = 'application/json; charset=UTF-8';
  const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`;

  const headers: Record<string, string> = {
    host: HOST,
    'content-type': contentType,
    'x-amz-date': amzDate,
    'x-amz-target': target,
    'content-encoding': 'amz-1.0',
  };

  const signedHeaderKeys = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((k) => `${k}:${headers[k]}\n`)
    .join('');

  const canonicalRequest = [
    'POST',
    `/paapi5/${operation.toLowerCase()}`,
    '',
    canonicalHeaders,
    signedHeaderKeys,
    sha256(payload),
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, SERVICE);
  const signature = hmacSHA256(signingKey, stringToSign).toString('hex');

  const authorization = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaderKeys}, Signature=${signature}`;

  return {
    ...headers,
    authorization,
  };
}

// --- Rate limiting ---

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1000) {
    await new Promise((r) => setTimeout(r, 1000 - elapsed));
  }
  lastRequestTime = Date.now();
}

// --- API call with retry ---

async function callApi(
  operation: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  await waitForRateLimit();

  const payload = JSON.stringify(body);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  const headers = signRequest(operation, payload, amzDate, dateStamp);
  const url = `https://${HOST}/paapi5/${operation.toLowerCase()}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: payload,
      });

      if (res.status === 200) {
        return await res.json();
      }

      if (res.status === 401) {
        throw new Error(
          `[PA-API] Authentication failed (401). Check your AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY.`,
        );
      }

      if (res.status === 429 || res.status >= 500) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * RETRY_CONFIG.backoffMultiplier ** attempt,
          RETRY_CONFIG.maxDelay,
        );
        console.warn(
          `[PA-API] ${res.status} on attempt ${attempt + 1}, retrying in ${delay}ms...`,
        );
        await new Promise((r) => setTimeout(r, delay));
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }

      const errorBody = await res.text();
      console.error(`[PA-API] Request failed (${res.status}):`, errorBody);
      throw new Error(`PA-API error ${res.status}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication failed')) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * RETRY_CONFIG.backoffMultiplier ** attempt,
          RETRY_CONFIG.maxDelay,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error('[PA-API] Unknown error after retries');
}

// --- Response parsing ---

function createPlaceholder(asin: string): Product {
  return {
    asin,
    title: '商品情報を取得できませんでした',
    url: `https://${MARKETPLACE}/dp/${asin}?tag=${ASSOCIATE_TAG}`,
    imageUrl: '',
    price: null,
    originalPrice: null,
    rating: null,
    features: [],
    brand: null,
    fetchedAt: new Date().toISOString(),
  };
}

function parseItem(item: Record<string, unknown>): Product {
  const asin = (item.ASIN as string) ?? '';

  const itemInfo = item.ItemInfo as Record<string, unknown> | undefined;
  const title =
    (itemInfo?.Title as Record<string, unknown>)?.DisplayValue as string ??
    '';

  const byLine = itemInfo?.ByLineInfo as Record<string, unknown> | undefined;
  const brand =
    ((byLine?.Brand as Record<string, unknown>)?.DisplayValue as string) ??
    null;

  const featuresObj = itemInfo?.Features as Record<string, unknown> | undefined;
  const features = (featuresObj?.DisplayValues as string[]) ?? [];

  const images = item.Images as Record<string, unknown> | undefined;
  const primaryImage = images?.Primary as Record<string, unknown> | undefined;
  const largeImage = primaryImage?.Large as Record<string, unknown> | undefined;
  const imageUrl = (largeImage?.URL as string) ?? '';

  const offers = item.Offers as Record<string, unknown> | undefined;
  const listings = (offers?.Listings as Record<string, unknown>[]) ?? [];
  const listing = listings[0] as Record<string, unknown> | undefined;

  let price: Product['price'] = null;
  if (listing?.Price) {
    const p = listing.Price as Record<string, unknown>;
    price = {
      amount: (p.Amount as number) ?? 0,
      currency: (p.Currency as string) ?? 'JPY',
      displayAmount: (p.DisplayAmount as string) ?? '',
    };
  }

  let originalPrice: Product['originalPrice'] = null;
  if (listing?.SavingBasis) {
    const s = listing.SavingBasis as Record<string, unknown>;
    originalPrice = {
      amount: (s.Amount as number) ?? 0,
      currency: (s.Currency as string) ?? 'JPY',
      displayAmount: (s.DisplayAmount as string) ?? '',
    };
  }

  const reviews = item.CustomerReviews as Record<string, unknown> | undefined;
  let rating: Product['rating'] = null;
  if (reviews?.StarRating) {
    rating = {
      value: (reviews.StarRating as Record<string, unknown>)?.Value as number ?? 0,
      count: (reviews.Count as number) ?? 0,
    };
  }

  return {
    asin,
    title,
    url: `https://${MARKETPLACE}/dp/${asin}?tag=${ASSOCIATE_TAG}`,
    imageUrl,
    price,
    originalPrice,
    rating,
    features: features.slice(0, 5),
    brand,
    fetchedAt: new Date().toISOString(),
  };
}

// --- Public API ---

export function isApiConfigured(): boolean {
  return !!(ACCESS_KEY && SECRET_KEY && ASSOCIATE_TAG);
}

export async function getProductByAsin(asin: string): Promise<Product> {
  const cached = getCachedProduct(asin);
  if (cached) return cached;

  if (!isApiConfigured()) {
    console.warn('[PA-API] API not configured, returning placeholder');
    const expired = getExpiredCachedProduct(asin);
    return expired ?? createPlaceholder(asin);
  }

  try {
    const data = (await callApi('GetItems', {
      ItemIds: [asin],
      Resources: ITEM_RESOURCES,
      PartnerTag: ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: MARKETPLACE,
    })) as Record<string, unknown>;

    const items = (data.ItemsResult as Record<string, unknown>)
      ?.Items as Record<string, unknown>[];
    if (!items?.length) {
      console.warn(`[PA-API] No item found for ASIN: ${asin}`);
      return getExpiredCachedProduct(asin) ?? createPlaceholder(asin);
    }

    const product = parseItem(items[0]);
    setCachedProduct(asin, product);
    return product;
  } catch (err) {
    console.error(`[PA-API] Failed to get product ${asin}:`, err);
    const expired = getExpiredCachedProduct(asin);
    if (expired) {
      console.warn(`[PA-API] Using expired cache for ${asin}`);
      return expired;
    }
    return createPlaceholder(asin);
  }
}

export async function getProductsByAsins(
  asins: string[],
): Promise<Product[]> {
  const results: Product[] = [];
  const uncached: string[] = [];

  for (const asin of asins) {
    const cached = getCachedProduct(asin);
    if (cached) {
      results.push(cached);
    } else {
      uncached.push(asin);
    }
  }

  if (uncached.length === 0 || !isApiConfigured()) {
    for (const asin of uncached) {
      results.push(getExpiredCachedProduct(asin) ?? createPlaceholder(asin));
    }
    return asins.map((a) => results.find((r) => r.asin === a)!);
  }

  const batches: string[][] = [];
  for (let i = 0; i < uncached.length; i += 10) {
    batches.push(uncached.slice(i, i + 10));
  }

  for (const batch of batches) {
    try {
      const data = (await callApi('GetItems', {
        ItemIds: batch,
        Resources: ITEM_RESOURCES,
        PartnerTag: ASSOCIATE_TAG,
        PartnerType: 'Associates',
        Marketplace: MARKETPLACE,
      })) as Record<string, unknown>;

      const items =
        ((data.ItemsResult as Record<string, unknown>)
          ?.Items as Record<string, unknown>[]) ?? [];

      for (const item of items) {
        const product = parseItem(item);
        setCachedProduct(product.asin, product);
        results.push(product);
      }

      const fetched = new Set(items.map((i) => (i.ASIN as string) ?? ''));
      for (const asin of batch) {
        if (!fetched.has(asin)) {
          results.push(
            getExpiredCachedProduct(asin) ?? createPlaceholder(asin),
          );
        }
      }
    } catch (err) {
      console.error('[PA-API] Batch fetch failed:', err);
      for (const asin of batch) {
        results.push(
          getExpiredCachedProduct(asin) ?? createPlaceholder(asin),
        );
      }
    }
  }

  return asins.map(
    (a) => results.find((r) => r.asin === a) ?? createPlaceholder(a),
  );
}

export async function searchProducts(
  keywords: string,
  category?: string,
): Promise<Product[]> {
  if (!isApiConfigured()) {
    console.warn('[PA-API] API not configured, cannot search');
    return [];
  }

  try {
    const body: Record<string, unknown> = {
      Keywords: keywords,
      Resources: ITEM_RESOURCES,
      PartnerTag: ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: MARKETPLACE,
      ItemCount: 10,
    };
    if (category) body.SearchIndex = category;

    const data = (await callApi(
      'SearchItems',
      body,
    )) as Record<string, unknown>;

    const items =
      ((data.SearchResult as Record<string, unknown>)
        ?.Items as Record<string, unknown>[]) ?? [];

    return items.map((item) => {
      const product = parseItem(item);
      setCachedProduct(product.asin, product);
      return product;
    });
  } catch (err) {
    console.error('[PA-API] Search failed:', err);
    return [];
  }
}
