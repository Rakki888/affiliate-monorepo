# SEO 仕様書

> **IMPORTANT: メタタグ・構造化データ・サイトマップなど SEO 関連の実装時は必ず本ドキュメントを参照すること。**
> JSON-LD のスキーマ・OGP タグ・パフォーマンス目標はすべて本書の仕様に従う。
> 関連: [`README.md`](./README.md) / [`architecture.md`](./architecture.md) / [`component-spec.md`](./component-spec.md)（商品の構造化データ） / [`deal-pipeline.md`](./deal-pipeline.md)（セール記事ページのメタ） / [`requirement.md`](./requirement.md)（非機能要件）

## 1. メタタグ

### 1.1 基本メタタグ

全ページで以下のメタタグを `<head>` 内に出力する。

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{ページタイトル} | {サイト名}</title>
<meta name="description" content="{ページの説明文}" />
<link rel="canonical" href="{正規URL}" />
<meta name="robots" content="index, follow" />
```

### 1.2 ページ別のメタタグ生成ルール

| ページ | title | description |
|--------|-------|-------------|
| トップ | `{サイト名}` | サイトの説明文（site.ts で定義） |
| 記事詳細 | `{記事タイトル} \| {サイト名}` | 記事の description フロントマター |
| カテゴリ | `{カテゴリ名}の記事一覧 \| {サイト名}` | `{カテゴリ名}に関する記事の一覧です。` |
| タグ | `{タグ名}の記事一覧 \| {サイト名}` | `{タグ名}に関する記事の一覧です。` |
| About | `サイトについて \| {サイト名}` | 固定テキスト |
| Privacy | `プライバシーポリシー \| {サイト名}` | 固定テキスト |

## 2. OGP（Open Graph Protocol）

### 2.1 共通 OGP タグ

```html
<meta property="og:site_name" content="{サイト名}" />
<meta property="og:locale" content="ja_JP" />
```

### 2.2 記事ページの OGP

```html
<meta property="og:type" content="article" />
<meta property="og:title" content="{記事タイトル}" />
<meta property="og:description" content="{記事の説明文}" />
<meta property="og:url" content="{記事のURL}" />
<meta property="og:image" content="{OGP画像URL}" />
<meta property="article:published_time" content="{公開日ISO8601}" />
<meta property="article:modified_time" content="{更新日ISO8601}" />
<meta property="article:section" content="{カテゴリ名}" />
<meta property="article:tag" content="{タグ名}" />
```

### 2.3 トップページの OGP

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="{サイト名}" />
<meta property="og:description" content="{サイトの説明文}" />
<meta property="og:url" content="{サイトURL}" />
<meta property="og:image" content="{デフォルトOGP画像URL}" />
```

### 2.4 Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{タイトル}" />
<meta name="twitter:description" content="{説明文}" />
<meta name="twitter:image" content="{OGP画像URL}" />
```

## 3. 構造化データ（JSON-LD）

### 3.1 WebSite（トップページ）

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{サイト名}",
  "url": "{サイトURL}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{サイトURL}/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 3.2 Article（記事ページ）

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{記事タイトル}",
  "description": "{記事の説明文}",
  "image": "{記事のOGP画像}",
  "datePublished": "{公開日}",
  "dateModified": "{更新日}",
  "author": {
    "@type": "Person",
    "name": "{著者名}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{サイト名}",
    "logo": {
      "@type": "ImageObject",
      "url": "{ロゴURL}"
    }
  }
}
```

### 3.3 Product（商品カード表示時）

商品カードが記事内に含まれる場合、商品ごとに出力する。

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{商品名}",
  "image": "{商品画像URL}",
  "brand": {
    "@type": "Brand",
    "name": "{ブランド名}"
  },
  "offers": {
    "@type": "Offer",
    "url": "{Amazon商品URL}",
    "priceCurrency": "JPY",
    "price": "{価格}",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{評価値}",
    "reviewCount": "{レビュー数}"
  }
}
```

### 3.4 BreadcrumbList（パンくずリスト）

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "{サイトURL}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{カテゴリ名}",
      "item": "{カテゴリURL}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{記事タイトル}"
    }
  ]
}
```

## 4. サイトマップ（sitemap.xml）

Astro の `@astrojs/sitemap` インテグレーションで自動生成する。

### 4.1 設定

```typescript
// astro.config.mjs
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  integrations: [sitemap()],
});
```

### 4.2 出力ルール

- 全ての公開ページを含む
- `draft: true` の記事は除外
- `changefreq` と `priority` の設定:

| ページ種別 | changefreq | priority |
|-----------|------------|----------|
| トップページ | daily | 1.0 |
| 記事詳細 | weekly | 0.8 |
| カテゴリ一覧 | weekly | 0.6 |
| タグ一覧 | weekly | 0.5 |
| About / Privacy | monthly | 0.3 |

## 5. RSS フィード

`/rss.xml` で配信する。

### 5.1 含める情報

- 記事タイトル
- 記事URL
- 公開日
- 説明文（description）
- カテゴリ

### 5.2 出力件数

最新20件

## 6. robots.txt

```
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap-index.xml
```

## 7. パフォーマンス最適化（SEO に影響する項目）

| 項目 | 対策 |
|------|------|
| 画像最適化 | Astro の `<Image>` コンポーネントで WebP 変換・リサイズ |
| 遅延読み込み | ファーストビュー外の画像に `loading="lazy"` |
| CSS最適化 | Tailwind の purge で未使用CSS除去 |
| フォント | `font-display: swap` で FOIT 防止 |
| プリロード | 重要なリソースに `<link rel="preload">` |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 を目標 |
