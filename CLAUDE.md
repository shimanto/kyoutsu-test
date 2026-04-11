# 共通テスト攻略プラットフォーム (kyoutsu-test)

## プロジェクト概要
東京大学理系合格を目標とした共通テスト攻略Webプラットフォーム。
配点ヒートマップスタイルで6教科ブロック×分野別小ブロックを配点サイズ比例で表示し、
正答率に応じて赤→緑にグラデーション変化する可視化が特徴。

## 技術スタック
- **モノレポ**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS 4 (`apps/web`)
- **API**: Hono on Cloudflare Workers (`apps/api`)
- **DB**: Cloudflare D1 (SQLite)
- **Auth**: LINE Login (LIFF SDK)
- **共通パッケージ**: `packages/shared` (型・定数・Zodスキーマ)

## 環境チェック（セッション開始時に必ず実行）
pnpmコマンドを使用する前に、以下を確認すること：
1. `pnpm --version` でpnpmがインストールされているか確認
2. インストールされていない場合は `npm install -g pnpm` でインストール
3. `package.json` の `packageManager` フィールドのバージョンと一致しているか確認

## 開発コマンド
```bash
pnpm install                    # 依存関係インストール
pnpm dev                        # turbo dev (全パッケージ)
cd apps/web && pnpm next dev    # フロントのみ
cd apps/api && pnpm wrangler dev # APIのみ
pnpm next build                 # ビルド確認 (apps/web)
cd apps/api && pnpm tsc --noEmit # API型チェック
```

## コアアルゴリズム
- SM-2忘却曲線: `apps/api/src/services/spaced-repetition.ts`
- 弱点検出: `apps/api/src/services/weakpoint-detector.ts`
- 学習計画生成: `apps/api/src/services/plan-generator.ts`

## 対象科目 (9科目 合計900点)
国語(200)・数学IA(100)・数学IIB/C(100)・英語R(100)・英語L(100)・物理(100)・化学(100)・社会(100)・情報I(100)

## 注意事項
- 大学によってヒートマップの見え方が異なる（東大理三は全科目高得点必須、他大学は目標が低いので緑が多い）
- 初回は模試スコア入力→ヒートマップ初期化のフロー
- コンテンツは随時追加方式（PDF→OCR→DB, XML構造化ファイル）
