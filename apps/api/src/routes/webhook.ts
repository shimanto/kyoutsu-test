import { Hono } from "hono";
import type { Env } from "../types";

const webhook = new Hono<Env>();

/**
 * LINE Messaging API Webhook
 * POST /webhook/line
 *
 * LINE Developers Console の Webhook URL に以下を設定:
 * https://kyoutsu-api.miyata-d23.workers.dev/webhook/line
 */
webhook.post("/line", async (c) => {
  const body = await c.req.json<{
    events: {
      type: string;
      replyToken?: string;
      source?: { userId?: string; type?: string };
      message?: { type: string; text?: string };
    }[];
  }>();

  const token = c.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!token) return c.json({ ok: true });

  for (const event of body.events || []) {
    // メッセージイベントに自動返信
    if (event.type === "message" && event.replyToken && event.message?.type === "text") {
      const text = event.message.text || "";

      let replyText = "";
      if (text.includes("ヘルプ") || text.includes("help")) {
        replyText = "📚 大学物語 ヘルプ\n\n・「学習」→ 今日の復習状況\n・「弱点」→ 弱点分野の確認\n・「ヘルプ」→ このメッセージ\n\n🔗 https://daigaku-monogatari.pages.dev";
      } else if (text.includes("学習") || text.includes("復習")) {
        replyText = "📖 学習ページはこちら:\nhttps://daigaku-monogatari.pages.dev/study\n\n忘却曲線が最適な復習タイミングを教えてくれます。";
      } else if (text.includes("弱点")) {
        replyText = "🎯 弱点ドリルはこちら:\nhttps://daigaku-monogatari.pages.dev/study/weakness\n\n赤を緑に塗り替えろ！";
      } else {
        replyText = "📚 大学物語へようこそ！\n\n弱点が見える。だから伸びる。\n\n「ヘルプ」と送信すると使い方を確認できます。\n\n🔗 https://daigaku-monogatari.pages.dev";
      }

      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }],
        }),
      });
    }

    // フォローイベント（友達追加）
    if (event.type === "follow" && event.replyToken) {
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: [{
            type: "text",
            text: "📚 大学物語へようこそ！\n\n弱点が見える。だから伸びる。\n共通テスト全9科目をヒートマップで可視化する学習プラットフォームです。\n\n🔗 https://daigaku-monogatari.pages.dev/lp\n\nまずは上のリンクからログインして学習を始めましょう！",
          }],
        }),
      });
    }
  }

  return c.json({ ok: true });
});

export default webhook;
