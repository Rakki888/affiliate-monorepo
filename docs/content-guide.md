# 記事作成ガイド

> **IMPORTANT: 記事の作成・テンプレートの修正時は必ず本ドキュメントを参照すること。**
> フロントマター定義・商品コンポーネントの使い方・ファイル命名規則はすべて本書に従う。
> 関連: [`component-spec.md`](./component-spec.md)（商品コンポーネントの Props 詳細） / [`seo-spec.md`](./seo-spec.md)（メタタグ生成ルール）

## 1. 記事ファイルの配置

記事は `src/content/blog/` ディレクトリに `.mdx` ファイルとして作成する。

```
src/content/blog/
├── best-wireless-earphones-2026.mdx
├── iphone-case-review.mdx
└── kindle-paperwhite-vs-oasis.mdx
```

ファイル名がそのまま URL のスラッグになる。

- 例: `best-wireless-earphones-2026.mdx` → `/blog/best-wireless-earphones-2026`

### ファイル名のルール

- 半角英数字とハイフンのみ使用
- 日本語は使わない（URL の可読性のため）
- キーワードを含めた意味のある名前にする
- 年を含める場合はファイル名末尾に付ける（例: `...-2026`）

## 2. フロントマター

記事ファイルの先頭に YAML 形式でメタ情報を記述する。

### 2.1 全項目

```yaml
---
title: "【2026年】おすすめワイヤレスイヤホン10選｜コスパ最強モデルを徹底比較"
description: "2026年最新のワイヤレスイヤホンを徹底比較。音質・ノイズキャンセリング・バッテリーなどの観点からおすすめ10モデルを厳選しました。"
category: "ガジェット"
tags: ["イヤホン", "ワイヤレス", "2026年"]
publishedAt: 2026-03-26
updatedAt: 2026-03-26
image: "./images/wireless-earphones-2026.jpg"
draft: false
---
```

### 2.2 各項目の説明

| 項目 | 型 | 必須 | 説明 |
|------|-----|------|------|
| title | string | Yes | 記事タイトル（60文字以内推奨、SEO対策） |
| description | string | Yes | 記事の説明文（120文字以内推奨、メタディスクリプションに使用） |
| category | string | Yes | カテゴリ名（1つのみ） |
| tags | string[] | Yes | タグ名の配列 |
| publishedAt | date | Yes | 公開日（YYYY-MM-DD） |
| updatedAt | date | No | 更新日（省略時は公開日と同じ） |
| image | string | No | アイキャッチ画像のパス |
| draft | boolean | No | `true` でビルド時に非公開（デフォルト: `false`） |

## 3. 記事本文の書き方

### 3.1 見出し

h2 と h3 を使う。h1 は記事タイトルとして自動出力されるため使わない。

```markdown
## 大見出し（h2）

本文テキスト...

### 小見出し（h3）

本文テキスト...
```

### 3.2 通常のテキスト

Markdown の標準記法で記述する。

```markdown
普通の段落テキストです。**太字**や*斜体*も使えます。

- リスト項目1
- リスト項目2
- リスト項目3

1. 番号付きリスト1
2. 番号付きリスト2
```

### 3.3 画像の挿入

記事ごとの画像は `src/content/blog/images/` に配置する。

```markdown
![画像の説明テキスト](./images/example.jpg)
```

## 4. 商品コンポーネントの使い方

MDX ファイルでは、インポートなしで商品コンポーネントを使用できる（グローバル登録済み）。

### 4.1 商品カード

単一商品を紹介する際に使用。

```mdx
<ProductCard asin="B09V3KXJPB" />
```

ラベルと説明文を追加する場合:

```mdx
<ProductCard
  asin="B09V3KXJPB"
  label="イチオシ"
  description="ノイズキャンセリング搭載でこの価格は破格。通勤・通学のお供に最適です。"
/>
```

### 4.2 商品比較テーブル

複数商品を並べて比較する際に使用。

```mdx
<CompareTable
  asins={["B09V3KXJPB", "B0BSHF7WHW", "B0CDR3MQ1D"]}
  features={["バッテリー", "重量", "ノイキャン"]}
  highlight="B09V3KXJPB"
/>
```

### 4.3 ランキング

おすすめ商品を順位付きで紹介する際に使用。

```mdx
<RankingList
  title="おすすめワイヤレスイヤホン TOP3"
  items={[
    {
      asin: "B09V3KXJPB",
      comment: "総合力No.1。迷ったらこれ。",
      pros: ["音質が良い", "ノイキャン優秀", "装着感◎"],
      cons: ["価格が高め"]
    },
    {
      asin: "B0BSHF7WHW",
      comment: "5,000円以下で最強コスパ。",
      pros: ["安い", "軽い", "防水"],
      cons: ["ノイキャンなし", "音質は普通"]
    },
    {
      asin: "B0CDR3MQ1D",
      comment: "Apple ユーザーならこれ一択。",
      pros: ["Apple連携◎", "空間オーディオ"],
      cons: ["Android だと機能制限あり"]
    }
  ]}
/>
```

## 5. ASIN の調べ方

ASIN は Amazon 商品ページの URL に含まれている。

```
https://www.amazon.co.jp/dp/B09V3KXJPB/
                            ^^^^^^^^^^
                            これがASIN
```

商品ページの「登録情報」セクションにも記載されている。

## 6. 記事テンプレート

### 6.1 レビュー記事テンプレート

```mdx
---
title: "【レビュー】{商品名}を実際に使ってみた感想"
description: "{商品名}を購入して実際に使ってみた正直なレビューです。良い点・悪い点を詳しく解説します。"
category: "カテゴリ名"
tags: ["タグ1", "タグ2"]
publishedAt: 2026-01-01
---

## {商品名}とは

（商品の概要を2-3文で説明）

<ProductCard asin="XXXXXXXXXX" />

## 良かった点

### ポイント1

（詳細な説明）

### ポイント2

（詳細な説明）

## 気になった点

### ポイント1

（詳細な説明）

## こんな人におすすめ

- おすすめな人の特徴1
- おすすめな人の特徴2

## まとめ

（総評を2-3文で）

<ProductCard asin="XXXXXXXXXX" label="この記事で紹介した商品" />
```

### 6.2 ランキング記事テンプレート

```mdx
---
title: "【{年}年】おすすめ{ジャンル}{数}選｜{切り口}"
description: "{年}年最新の{ジャンル}を徹底比較。{切り口}の観点からおすすめ{数}モデルを厳選しました。"
category: "カテゴリ名"
tags: ["タグ1", "タグ2", "{年}年"]
publishedAt: 2026-01-01
---

## {ジャンル}の選び方

### チェックポイント1

（説明）

### チェックポイント2

（説明）

## おすすめ{ジャンル}ランキング

<RankingList
  title="おすすめ{ジャンル} TOP{数}"
  items={[
    { asin: "...", comment: "...", pros: ["..."], cons: ["..."] },
  ]}
/>

## 比較表

<CompareTable
  asins={["...", "...", "..."]}
  features={["特徴1", "特徴2", "特徴3"]}
  highlight="..."
/>

## まとめ

（総評）
```

## 7. 記事作成チェックリスト

- [ ] ファイル名は半角英数字・ハイフンのみ
- [ ] フロントマターの必須項目をすべて記入した
- [ ] title は60文字以内
- [ ] description は120文字以内
- [ ] ASIN が正しいことを確認した
- [ ] 商品コンポーネントの構文が正しい
- [ ] 見出し構造が h2 → h3 の階層になっている
- [ ] 画像に alt テキストを設定した
- [ ] draft を false にした（公開する場合）
