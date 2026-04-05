/**
 * 管理者へのLINEログイン通知
 * LINEログイン時にリアルタイムで管理者にプッシュ通知を送信する
 */

interface NotifyAdminLoginParams {
  db: D1Database;
  token: string;
  displayName: string;
  lineUserId: string;
  isNewUser: boolean;
}

export async function notifyAdminLogin({
  db,
  token,
  displayName,
  lineUserId,
  isNewUser,
}: NotifyAdminLoginParams): Promise<void> {
  try {
    // 管理者のLINE user IDを取得
    const admins = await db
      .prepare(
        "SELECT line_user_id FROM users WHERE role = 'admin' AND line_user_id NOT LIKE 'demo-%'"
      )
      .all<{ line_user_id: string }>();

    const adminLineIds = admins.results.map((a) => a.line_user_id);
    if (adminLineIds.length === 0) return;

    const now = new Date();
    const jstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const loginTime = jstTime
      .toISOString()
      .replace("T", " ")
      .replace(/\.\d+Z$/, "")
      .slice(0, 19);

    const adminUrl = "https://kanri-daimono.pages.dev/admin";
    const userType = isNewUser ? "🆕 新規ユーザー" : "ログイン";

    const message =
      `📢 ${userType}通知\n\n` +
      `👤 ユーザー名: ${displayName}\n` +
      `🕐 ログイン時刻: ${loginTime} (JST)\n` +
      `🆔 LINE ID: ${lineUserId}\n\n` +
      `🔗 管理ページ:\n${adminUrl}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (adminLineIds.length === 1) {
      // 1人の場合はpush
      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers,
        body: JSON.stringify({
          to: adminLineIds[0],
          messages: [{ type: "text", text: message }],
        }),
      });
    } else {
      // 複数の場合はmulticast
      await fetch("https://api.line.me/v2/bot/message/multicast", {
        method: "POST",
        headers,
        body: JSON.stringify({
          to: adminLineIds,
          messages: [{ type: "text", text: message }],
        }),
      });
    }
  } catch (e) {
    // 通知失敗はログインフローをブロックしない
    console.error("Admin login notification failed:", e);
  }
}
