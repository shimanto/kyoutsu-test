/**
 * PWAアイコン & OGP画像 生成スクリプト
 *
 * 統一デザインの icon.svg / og-image.svg から各サイズのPNGを生成
 *
 * 生成物:
 *   icon.svg    → icon-192.png, icon-512.png
 *   og-image.svg → og-image.png (1200x630)
 *
 * 使い方:
 *   node scripts/generate-icons.js
 *
 * 前提: sharp がインストール済み (pnpm add -D sharp)
 * 代替: https://svgtopng.com/ で手動変換
 */

const { execSync } = require("child_process");
const path = require("path");

const publicDir = path.join(__dirname, "..", "apps", "web", "public");

const tasks = [
  { input: "icon.svg", output: "icon-192.png", width: 192, height: 192 },
  { input: "icon.svg", output: "icon-512.png", width: 512, height: 512 },
  { input: "og-image.svg", output: "og-image.png", width: 1200, height: 630 },
];

let hasSharp = false;
try {
  require.resolve("sharp");
  hasSharp = true;
} catch {
  // sharp not available
}

async function main() {
  if (hasSharp) {
    const sharp = require("sharp");
    for (const task of tasks) {
      const inputPath = path.join(publicDir, task.input);
      const outputPath = path.join(publicDir, task.output);
      try {
        await sharp(inputPath)
          .resize(task.width, task.height)
          .png({ quality: 90 })
          .toFile(outputPath);
        console.log(`  Generated ${task.output} (${task.width}x${task.height})`);
      } catch (err) {
        console.error(`  Failed ${task.output}: ${err.message}`);
      }
    }
  } else {
    console.log("sharp not available. Manual conversion needed:");
    console.log("");
    for (const task of tasks) {
      console.log(`  ${task.input} → ${task.output} (${task.width}x${task.height})`);
    }
    console.log("");
    console.log("Install sharp: pnpm add -D sharp");
    console.log("Or use: https://svgtopng.com/");
  }
}

main();
