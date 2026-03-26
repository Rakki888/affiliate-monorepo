# 開発タスク管理

> **IMPORTANT: 各タスクの実装前に、該当する仕様ドキュメントを必ず確認すること。**
>
> | Phase | 参照すべきドキュメント |
> |-------|----------------------|
> | Phase 1 | [`architecture.md`](./architecture.md) |
> | Phase 2 | [`amazon-api.md`](./amazon-api.md) |
> | Phase 3 | [`component-spec.md`](./component-spec.md), [`amazon-api.md`](./amazon-api.md) |
> | Phase 4 | [`content-guide.md`](./content-guide.md), [`component-spec.md`](./component-spec.md) |
> | Phase 5 | [`seo-spec.md`](./seo-spec.md) |
> | Phase 6 | [`component-spec.md`](./component-spec.md), [`architecture.md`](./architecture.md) |
> | Phase 7 | [`requirement.md`](./requirement.md)（非機能要件の確認） |

## Phase 1: プロジェクト初期化・基本レイアウト

- [x] Astro プロジェクトの初期化（`npm create astro@latest`）
- [x] TypeScript 設定（`tsconfig.json`）
- [x] Tailwind CSS のセットアップ
- [x] React インテグレーションの追加（`@astrojs/react`）
- [x] MDX インテグレーションの追加（`@astrojs/mdx`）
- [x] `.env.example` の作成
- [x] `.gitignore` の設定（`cache/`, `.env`, `node_modules/` 等）
- [x] `src/config/site.ts` の作成（サイト名・URL・メニュー定義）
- [x] `src/styles/global.css` の作成（Tailwind ベーススタイル、ダークモード変数）
- [x] `src/layouts/BaseLayout.astro` の作成（共通 head, header, footer）
- [x] `src/layouts/BlogLayout.astro` の作成（記事用レイアウト）
- [x] `src/components/common/Header.astro` の実装
- [x] `src/components/common/Footer.astro` の実装
- [x] `src/components/common/Navigation.astro` の実装
- [x] `src/pages/index.astro` の仮実装（プレースホルダー）
- [x] ローカル開発サーバーの動作確認

## Phase 2: PA-API 連携モジュール・キャッシュ機構

- [x] 自前 AWS Signature V4 署名で実装（外部 SDK 不使用）
- [x] `src/lib/amazon-api.ts` の実装
  - [x] AWS Signature V4 署名処理
  - [x] `getProductByAsin()` 関数
  - [x] `getProductsByAsins()` 関数（バッチ取得）
  - [x] `searchProducts()` 関数
  - [x] レート制限対策（インターバル制御）
  - [x] リトライロジック（指数バックオフ）
  - [x] エラーハンドリング
- [x] `src/lib/cache.ts` の実装
  - [x] `cache/products.json` の読み書き
  - [x] 有効期限チェック（24時間）
  - [x] フォールバック処理（API失敗時に古いキャッシュを使用）
  - [x] 期限切れキャッシュのクリーンアップ
- [x] Product 型定義（`src/types/product.ts`）
- [x] 環境変数の読み込みとバリデーション
- [x] PA-API 接続テスト（テスト用ASINで商品取得確認）

## Phase 3: 商品表示コンポーネント

- [x] `src/components/product/ProductCard.astro` の実装
  - [x] 商品画像・タイトル・価格・評価の表示
  - [x] アフィリエイトリンクボタン
  - [x] ラベルバッジ
  - [x] レスポンシブ対応（横長→縦長）
  - [x] ダークモード対応
- [x] `src/components/product/CompareTable.astro` の実装
  - [x] 横並びテーブルレイアウト
  - [x] ハイライト機能
  - [x] モバイルフォールバック
- [x] `src/components/product/RankingList.astro` の実装
  - [x] 順位バッジ（金・銀・銅）
  - [x] メリット / デメリットリスト
- [x] MDX でのグローバルコンポーネント登録設定
- [x] サンプルデータでの表示確認

## Phase 4: 記事テンプレート・カテゴリ/タグページ

- [x] コンテンツコレクション定義（`src/content.config.ts`）
- [x] サンプル記事の作成（`src/content/blog/sample-post.mdx`）
- [x] `src/pages/blog/[...slug].astro` の実装
  - [x] フロントマターからメタ情報を展開
  - [x] 目次の自動生成
  - [x] 関連記事の表示
- [x] `src/components/blog/ArticleCard.astro` の実装
- [x] `src/components/blog/ArticleMeta.astro` の実装
- [x] `src/components/blog/TableOfContents.astro` の実装
- [x] `src/components/blog/RelatedPosts.astro` の実装
- [x] `src/pages/index.astro` の本実装（最新記事一覧）
- [x] `src/pages/category/[name].astro` の実装
- [x] `src/pages/tag/[name].astro` の実装
- [x] `src/components/common/Pagination.astro` の実装
- [x] `src/components/common/Breadcrumb.astro` の実装

## Phase 5: SEO 対策

- [x] BaseLayout にメタタグ生成ロジックを追加
- [x] OGP タグの出力
- [x] Twitter Card の出力
- [x] 構造化データ（JSON-LD）の実装
  - [x] WebSite（トップページ）
  - [x] Article（記事ページ）
  - [x] Product（商品カード）
  - [x] BreadcrumbList（パンくず）
- [x] `@astrojs/sitemap` の設定
- [x] `src/pages/rss.xml.ts` の実装
- [x] `public/robots.txt` の作成
- [x] canonical URL の設定
- [ ] Lighthouse SEO スコア確認（目標: 95+）※デプロイ後に確認

## Phase 6: 検索機能・ダークモード・仕上げ

- [x] `fuse.js` のインストール
- [x] 検索インデックス生成ロジック（`src/lib/search.ts`）
- [x] `src/components/interactive/SearchBox.tsx` の実装
- [x] `src/components/interactive/DarkModeToggle.tsx` の実装
- [x] ダークモード CSS の調整
- [x] FOUC 防止のインラインスクリプト追加
- [x] `src/components/common/ShareButtons.astro` の実装
- [x] `src/pages/about.astro` の作成
- [x] `src/pages/privacy.astro` の作成（アフィリエイト開示文言含む）
- [x] モバイルナビゲーション（ハンバーガーメニュー）の実装
- [x] 全ページのレスポンシブ確認
- [ ] アクセシビリティ確認（Lighthouse Accessibility 90+ 目標）※デプロイ後に確認

## Phase 7: デプロイ・動作確認

- [ ] Vercel プロジェクトの作成 ※手動操作が必要
- [ ] 環境変数の設定（Vercel ダッシュボード）※手動操作が必要
- [x] `astro.config.mjs` にデプロイ設定追加
- [x] 本番ビルドテスト（`npm run build`）→ 7ページ正常生成確認済み
- [ ] Vercel へのデプロイ ※手動操作が必要
- [ ] 本番環境での動作確認 ※デプロイ後に確認
  - [ ] 全ページの表示確認
  - [ ] アフィリエイトリンクの動作確認
  - [ ] OGP 画像の表示確認
  - [ ] モバイルでの表示確認
- [ ] Lighthouse 総合スコア確認 ※デプロイ後に確認
- [ ] Google Search Console への登録 ※手動操作が必要
- [ ] サイトマップの送信 ※手動操作が必要

---

## 進捗サマリー

| Phase | 状態 | 完了タスク / 全タスク |
|-------|------|----------------------|
| Phase 1 | **完了** | 16 / 16 |
| Phase 2 | **完了** | 15 / 15 |
| Phase 3 | **完了** | 13 / 13 |
| Phase 4 | **完了** | 14 / 14 |
| Phase 5 | **完了** | 12 / 13 |
| Phase 6 | **完了** | 11 / 12 |
| Phase 7 | 一部手動 | 3 / 12 |
| **合計** | | **84 / 96** |
