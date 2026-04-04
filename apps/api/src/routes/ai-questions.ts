import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";

const aiQuestions = new Hono<Env>();

const generateSchema = z.object({
  fieldName: z.string().min(1),
  subjectName: z.string().min(1),
  difficulty: z.number().min(1).max(5).default(2),
  excludeBody: z.string().optional(),
});

/**
 * Workers AI で4択問題を生成
 * POST /ai-questions/generate
 */
aiQuestions.post("/generate", async (c) => {
  const body = await c.req.json();
  const { fieldName, subjectName, difficulty, excludeBody } = generateSchema.parse(body);

  const excludeNote = excludeBody
    ? `\n以下の問題とは異なる新しい問題を作成してください:\n「${excludeBody.slice(0, 100)}」`
    : "";

  const prompt = `あなたは日本の大学入学共通テストの問題作成者です。
以下の条件で4択問題を1問だけ作成してください。

科目: ${subjectName}
分野: ${fieldName}
難易度: ${difficulty}/5 (1=基礎, 3=標準, 5=発展)${excludeNote}

以下のJSON形式で出力してください。JSON以外は出力しないでください。
{
  "body": "問題文",
  "choices": [
    {"label": "1", "body": "選択肢1", "isCorrect": true},
    {"label": "2", "body": "選択肢2", "isCorrect": false},
    {"label": "3", "body": "選択肢3", "isCorrect": false},
    {"label": "4", "body": "選択肢4", "isCorrect": false}
  ],
  "explanation": "解説文。正解の理由と、各不正解選択肢が間違いである理由も含めてください。"
}

注意:
- 共通テストレベルの問題にすること
- 正解は必ず1つだけ
- 解説は各選択肢について言及すること
- 日本語で出力すること`;

  try {
    const res = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct" as BaseAiTextGenerationModels, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    const text = typeof res === "object" && "response" in res ? (res as { response: string }).response : "";

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return c.json({ error: "AI response parse failed", raw: text.slice(0, 500) }, 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // バリデーション
    if (!parsed.body || !Array.isArray(parsed.choices) || parsed.choices.length < 2) {
      return c.json({ error: "Invalid question format", raw: text.slice(0, 500) }, 500);
    }

    // 正解が1つだけあることを確認
    const correctCount = parsed.choices.filter((c: { isCorrect: boolean }) => c.isCorrect).length;
    if (correctCount !== 1) {
      // 修正: 最初の選択肢を正解にする
      parsed.choices.forEach((c: { isCorrect: boolean }, i: number) => { c.isCorrect = i === 0; });
    }

    return c.json({
      question: {
        id: `ai_${Date.now()}`,
        body: parsed.body,
        difficulty,
        choices: parsed.choices.map((ch: { label?: string; body: string; isCorrect: boolean }, i: number) => ({
          id: `ai_${Date.now()}_${i}`,
          label: ch.label || String(i + 1),
          body: ch.body,
          isCorrect: ch.isCorrect,
        })),
        explanation: parsed.explanation || "AI生成問題の解説です。",
      },
    });
  } catch (e) {
    return c.json({ error: `AI generation failed: ${e instanceof Error ? e.message : "unknown"}` }, 500);
  }
});

// ─── 変形問題生成 ───
const variantSchema = z.object({
  originalBody: z.string().min(1),
  choices: z.array(z.object({
    label: z.string(),
    body: z.string(),
    isCorrect: z.boolean(),
  })),
  newCorrectBody: z.string().min(1),
  subjectName: z.string().min(1),
  fieldName: z.string().min(1),
});

/**
 * Workers AI で変形問題を生成
 * 元の問題の選択肢はそのままに、問題文を書き換えて別の選択肢が正解になるようにする
 * POST /ai-questions/generate-variant
 */
aiQuestions.post("/generate-variant", async (c) => {
  const body = await c.req.json();
  const { originalBody, choices, newCorrectBody, subjectName, fieldName } = variantSchema.parse(body);

  const oldCorrect = choices.find((ch) => ch.isCorrect);
  const choicesText = choices.map((ch) => `${ch.label}. ${ch.body}${ch.isCorrect ? " (元の正解)" : ""}`).join("\n");

  const prompt = `あなたは日本の大学入学共通テストの問題作成者です。

以下の4択問題の「設問文」を書き換えて、「${newCorrectBody}」が正解になる新しい問題を作ってください。

【元の問題】
科目: ${subjectName} / 分野: ${fieldName}
設問文: ${originalBody}
選択肢:
${choicesText}
元の正解: ${oldCorrect?.body || ""}
新しい正解にしたい選択肢: ${newCorrectBody}

【重要なルール】
1. 選択肢は一切変更しない（そのまま使う）
2. 設問文を書き換えて「${newCorrectBody}」が唯一の正解になるようにする
3. 設問文は元の問題と同じ形式・トーンで、自然な日本語の問いかけにする
4. 「${newCorrectBody}」の内容に対応する正しい問いかけを作る

【禁止事項】
- 「変形」「解き直し」「正解となる設問」「次のうち〜が正解」などのメタ的な表現は絶対に使わない
- 元の設問文をそのまま残さない。必ず新しい正解に合った設問文に書き換える
- 設問文に正解を直接含めない

【例】
元の問題: 「ケッペンの気候区分で、Afが示す気候帯はどれか。」（正解: 熱帯雨林気候）
新しい正解: 地中海性気候
→ 書き換え後: 「ケッペンの気候区分で、Csが示す気候帯はどれか。」

元の問題: 「日本の初代内閣総理大臣は誰か。」（正解: 伊藤博文）
新しい正解: 黒田清隆
→ 書き換え後: 「日本の第2代内閣総理大臣は誰か。」

以下のJSON形式で出力してください。JSON以外は出力しないでください。
{
  "body": "書き換えた設問文（元と同じ形式で自然な問いかけ）",
  "explanation": "解説文。なぜ「${newCorrectBody}」が正解なのか、他の選択肢がなぜ不正解なのかを説明してください。"
}`;

  try {
    const res = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct" as BaseAiTextGenerationModels, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    const text = typeof res === "object" && "response" in res ? (res as { response: string }).response : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return c.json({ error: "AI response parse failed", raw: text.slice(0, 500) }, 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.body) {
      return c.json({ error: "Invalid variant format", raw: text.slice(0, 500) }, 500);
    }

    return c.json({
      body: parsed.body,
      explanation: parsed.explanation || "",
    });
  } catch (e) {
    return c.json({ error: `AI variant generation failed: ${e instanceof Error ? e.message : "unknown"}` }, 500);
  }
});

export default aiQuestions;
