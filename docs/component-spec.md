# コンポーネント仕様書

> **IMPORTANT: UI コンポーネントの実装・修正時は必ず本ドキュメントを参照すること。**
> Props 定義・表示要素・レイアウト仕様はすべて本書に従う。
> 関連: [`README.md`](./README.md) / [`amazon-api.md`](./amazon-api.md)（Product 型定義） / [`architecture.md`](./architecture.md)（ディレクトリ構成） / [`seo-spec.md`](./seo-spec.md)（構造化データ） / [`deal-pipeline.md`](./deal-pipeline.md)（自動記事での利用）

## 1. 商品系コンポーネント

### 1.1 ProductCard（商品カード）

単一商品をカード形式で表示する。記事内で最も頻繁に使用するコンポーネント。

**ファイル:** `src/components/product/ProductCard.astro`

**Props:**

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| asin | `string` | Yes | Amazon商品のASIN |
| label | `string` | No | カードに付けるラベル（「おすすめ」「コスパ最強」等） |
| description | `string` | No | 商品の補足説明（自分で書いたコメント） |

**表示要素:**

- 商品画像（Amazon から取得）
- 商品名（リンク付き）
- ブランド名
- 価格（セール価格と定価の両方表示）
- 星評価とレビュー数
- 商品特徴（箇条書き、最大3件）
- 「Amazonで見る」ボタン（アフィリエイトリンク）
- ラベルバッジ（指定時のみ）
- 補足説明テキスト（指定時のみ）

**レイアウト:** 横長カード（デスクトップ）→ 縦長カード（モバイル）

**MDX での使用例:**

```mdx
<ProductCard asin="B09V3KXJPB" label="おすすめ" description="コスパに優れた定番モデル" />
```

---

### 1.2 CompareTable（商品比較テーブル）

複数商品を横並びのテーブルで比較する。

**ファイル:** `src/components/product/CompareTable.astro`

**Props:**

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| asins | `string[]` | Yes | 比較する商品のASIN配列（2-5件） |
| features | `string[]` | No | 比較する項目名の配列 |
| highlight | `string` | No | おすすめとしてハイライトするASIN |

**表示要素:**

- 各商品の画像
- 商品名
- 価格
- 星評価
- 比較項目（features で指定した項目）
- 「Amazonで見る」リンク
- ハイライト商品にはバッジ表示

**レイアウト:** デスクトップは横スクロール可能なテーブル、モバイルはカード形式にフォールバック

**MDX での使用例:**

```mdx
<CompareTable
  asins={["B09V3KXJPB", "B0BSHF7WHW", "B0CDR3MQ1D"]}
  features={["バッテリー持ち", "重量", "ディスプレイサイズ"]}
  highlight="B09V3KXJPB"
/>
```

---

### 1.3 RankingList（ランキングリスト）

商品を順位付きで一覧表示する。

**ファイル:** `src/components/product/RankingList.astro`

**Props:**

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| items | `RankingItem[]` | Yes | ランキングアイテムの配列 |
| title | `string` | No | ランキングのタイトル |

**RankingItem 型:**

```typescript
interface RankingItem {
  asin: string;
  comment: string;         // 一言コメント
  pros?: string[];          // メリット
  cons?: string[];          // デメリット
}
```

**表示要素:**

- 順位バッジ（1位は金、2位は銀、3位は銅）
- 商品画像・名前・価格・評価（ProductCard と同等）
- 一言コメント
- メリット / デメリットリスト
- 「Amazonで見る」ボタン

**MDX での使用例:**

```mdx
<RankingList
  title="2026年おすすめワイヤレスイヤホン TOP5"
  items={[
    { asin: "B09V3KXJPB", comment: "総合力No.1", pros: ["音質◎", "ノイキャン◎"], cons: ["価格が高め"] },
    { asin: "B0BSHF7WHW", comment: "コスパ最強", pros: ["安い", "軽い"], cons: ["ノイキャンなし"] },
  ]}
/>
```

---

## 2. 共通コンポーネント

### 2.1 Header

**ファイル:** `src/components/common/Header.astro`

- サイトロゴ / サイト名
- ナビゲーションメニュー（カテゴリリンク）
- 検索アイコン（クリックで SearchBox 展開）
- ダークモード切替ボタン
- モバイル: ハンバーガーメニュー

### 2.2 Footer

**ファイル:** `src/components/common/Footer.astro`

- サイト名・コピーライト
- ナビゲーションリンク（About, Privacy）
- Amazon アソシエイトの開示文言
- カテゴリリンク一覧

### 2.3 Breadcrumb（パンくずリスト）

**ファイル:** `src/components/common/Breadcrumb.astro`

**Props:**

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| items | `BreadcrumbItem[]` | Yes | パンくず要素の配列 |

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;  // 最後の要素はリンクなし（現在ページ）
}
```

### 2.4 Pagination

**ファイル:** `src/components/common/Pagination.astro`

**Props:**

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| currentPage | `number` | Yes | 現在のページ番号 |
| totalPages | `number` | Yes | 総ページ数 |
| basePath | `string` | Yes | ベースパス（例: `/category/gadget`） |

### 2.5 ShareButtons（シェアボタン）

**ファイル:** `src/components/common/ShareButtons.astro`

**Props:**

| Prop | 型 | 必須 | 説明 |
|------|-----|------|------|
| title | `string` | Yes | シェアするタイトル |
| url | `string` | Yes | シェアするURL |

対応SNS: X（Twitter）、はてなブックマーク、LINE、コピー

---

## 3. ブログ系コンポーネント

### 3.1 ArticleCard（記事カード）

**ファイル:** `src/components/blog/ArticleCard.astro`

一覧ページで記事をカード形式で表示。

- サムネイル画像
- 記事タイトル
- カテゴリバッジ
- 投稿日
- 説明文（excerpt）

### 3.2 TableOfContents（目次）

**ファイル:** `src/components/blog/TableOfContents.astro`

記事内の見出し（h2, h3）から自動生成する目次。

### 3.3 RelatedPosts（関連記事）

**ファイル:** `src/components/blog/RelatedPosts.astro`

同一カテゴリ・タグの記事から最大4件を表示。

---

## 4. インタラクティブコンポーネント（React Islands）

### 4.1 SearchBox

**ファイル:** `src/components/interactive/SearchBox.tsx`

Fuse.js を使用したクライアントサイド全文検索。

- 検索入力フィールド
- リアルタイムサジェスト（入力中に結果表示）
- 検索結果一覧
- キーボードナビゲーション対応（上下キー + Enter）

### 4.2 DarkModeToggle

**ファイル:** `src/components/interactive/DarkModeToggle.tsx`

- ライト / ダーク / システム設定の3モード
- `localStorage` に設定を保存
- FOUC（ちらつき）防止のためインラインスクリプトで初期値を適用

---

## 5. デザイントークン

Tailwind CSS のカスタムテーマとして定義する主要な値。

| トークン | ライトモード | ダークモード |
|----------|-------------|-------------|
| 背景色（メイン） | `white` | `gray-900` |
| 背景色（カード） | `gray-50` | `gray-800` |
| テキスト色 | `gray-900` | `gray-100` |
| アクセントカラー | `amber-500` | `amber-400` |
| リンク色 | `blue-600` | `blue-400` |
| ボーダー色 | `gray-200` | `gray-700` |
| Amazon ボタン色 | `amber-400` | `amber-500` |
