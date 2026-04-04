/**
 * PWAアイコン生成スクリプト
 *
 * icon.svg → icon-192.png, icon-512.png を生成
 *
 * 使い方:
 *   npx sharp-cli -i apps/web/public/icon.svg -o apps/web/public/icon-192.png resize 192 192
 *   npx sharp-cli -i apps/web/public/icon.svg -o apps/web/public/icon-512.png resize 512 512
 *
 * または Canvas API (Node.js) で生成:
 */

const { execSync } = require("child_process");
const path = require("path");

const publicDir = path.join(__dirname, "..", "apps", "web", "public");
const svgPath = path.join(publicDir, "icon.svg");

const sizes = [192, 512];

for (const size of sizes) {
  const outPath = path.join(publicDir, `icon-${size}.png`);
  try {
    // sharp-cli がある場合
    execSync(`npx sharp -i "${svgPath}" -o "${outPath}" resize ${size} ${size}`, {
      stdio: "inherit",
    });
    console.log(`✓ Generated icon-${size}.png`);
  } catch {
    console.log(`⚠ sharp not available. Please manually convert icon.svg to icon-${size}.png`);
    console.log(`  Online tool: https://svgtopng.com/ or use Inkscape/Figma`);
  }
}
