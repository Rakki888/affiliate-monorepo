# ドキュメント索引（`docs/`）

> **IMPORTANT: 本プロジェクトの開発・運用では、必ず `docs/` 配下を参照すること。**
> 仕様・設計・タスク・自動化の前提はここに集約している。コードを変更する前に該当ドキュメントを読み、仕様と齟齬がないか確認すること。

## 一覧（参照タイミング順）

| ドキュメント | 内容 | いつ読むか |
|-------------|------|-----------|
| [`requirement.md`](./requirement.md) | 要件定義（機能・非機能・Phase・制約） | スコープや優先度を決めるとき |
| [`architecture.md`](./architecture.md) | 技術スタック・アーキテクチャ・ディレクトリ | 構成変更・新モジュール追加のとき |
| [`amazon-api.md`](./amazon-api.md) | PA-API 5.0 連携・キャッシュ・環境変数 | 商品取得ロジックを触るとき |
| [`component-spec.md`](./component-spec.md) | UI コンポーネントの Props・レイアウト | コンポーネント実装・MDX 埋め込みのとき |
| [`seo-spec.md`](./seo-spec.md) | メタ・OGP・JSON-LD・サイトマップ | SEO や head 周りを変えるとき |
| [`content-guide.md`](./content-guide.md) | 記事の置き場所・フロントマター・テンプレ | 手動記事作成・自動生成記事の体裁を揃えるとき |
| [`deal-pipeline.md`](./deal-pipeline.md) | スクレイピング連携・セール検知・記事自動生成・X 投稿 | Phase 8・日次ジョブ・別リポジトリ連携のとき |
| [`tasks.md`](./tasks.md) | フェーズ別チェックリスト・進捗 | 作業の着手・完了報告のとき |

## 関連リポジトリ（ブログ外）

- **スクレイピング日次ジョブ**: `C:\Users\taimai\Desktop\スクレイピング`（Python・GitHub Actions）
- 詳細は [`deal-pipeline.md`](./deal-pipeline.md) を参照。

## 更新ルール

- 仕様変更したら **対応する `docs/` を同じ PR / コミットで更新** する。
- 新しい横断的な仕様（例: 自動投稿）を追加したら、本 README の表と各ドキュメントの **IMPORTANT** ブロックにリンクを足す。
