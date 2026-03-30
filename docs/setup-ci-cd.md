# CI/CD セットアップ手順

## GitHub Actions の仕組み

### PRワークフロー (自動)
PR作成・更新時に自動実行:
1. 型チェック (API + Shared)
2. ユニットテスト (SM-2アルゴリズム等)
3. フロントビルド (Next.js static export)

### デプロイワークフロー (mainプッシュ時)
main ブランチへのプッシュ時に自動実行:
1. lint-and-test ジョブ (上記と同じ)
2. deploy ジョブ (Cloudflare Pagesへデプロイ)

## 必要な GitHub Secrets

### CLOUDFLARE_ACCOUNT_ID
✅ 設定済み: `d237a2529ccabbd12c8d7e2e644780c1`

### CLOUDFLARE_API_TOKEN
以下の手順で作成:

1. https://dash.cloudflare.com/profile/api-tokens にアクセス
2. 「Create Token」をクリック
3. 「Custom token」の「Get started」をクリック
4. 設定:
   - Token name: `daigaku-monogatari-ci`
   - Permissions:
     - Account > Cloudflare Pages > Edit
   - Account Resources:
     - Include > Miyata@shimanto.com's Account
5. 「Continue to summary」→「Create Token」
6. トークンをコピー
7. GitHub リポジトリ Settings > Secrets and variables > Actions で `CLOUDFLARE_API_TOKEN` として設定

## ローカルでの確認コマンド

```bash
# テスト実行
cd apps/api && pnpm vitest run

# 型チェック
cd apps/api && pnpm tsc --noEmit
cd packages/shared && pnpm tsc --noEmit

# ビルド
cd apps/web && pnpm next build

# 手動デプロイ
npx wrangler pages deploy apps/web/out --project-name daigaku-monogatari --branch main
```
