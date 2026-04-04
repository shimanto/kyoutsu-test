/**
 * OGP画像 PNG 生成スクリプト
 *
 * og-image.svg → og-image.png (1200x630) を生成
 * LINE/Twitter等でSVGが表示されない問題を解決
 *
 * 使い方:
 *   node scripts/generate-og-png.js
 *
 * 前提: sharp がインストール済み (pnpm add -D sharp)
 */

const path = require("path");

const publicDir = path.join(__dirname, "..", "apps", "web", "public");
const svgPath = path.join(publicDir, "og-image.svg");
const pngPath = path.join(publicDir, "og-image.png");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.log("⚠ sharp が見つかりません。以下のコマンドでインストールしてください:");
    console.log("  pnpm add -D sharp");
    console.log("");
    console.log("代替手段:");
    console.log("  1. https://svgtopng.com/ で og-image.svg を 1200x630 PNG に変換");
    console.log("  2. 生成した PNG を apps/web/public/og-image.png に配置");
    process.exit(1);
  }

  try {
    await sharp(svgPath)
      .resize(1200, 630)
      .png({ quality: 90 })
      .toFile(pngPath);

    console.log("✓ Generated og-image.png (1200x630)");
    console.log(`  Output: ${pngPath}`);
  } catch (err) {
    console.error("✗ PNG生成に失敗:", err.message);
    console.log("");
    console.log("手動変換が必要な場合:");
    console.log("  1. https://svgtopng.com/ で og-image.svg を変換");
    console.log("  2. apps/web/public/og-image.png として保存");
    process.exit(1);
  }
}

main();
