/**
 * 問題自動生成エンジン
 *
 * 各分野のテンプレートからパラメータを変化させて
 * ユニークな問題を大量生成する。
 * 手書き問題(sample-data.ts)と組み合わせて使用。
 */

import type { SampleQuestion } from "./sample-data";

// ── 乱数ユーティリティ (シード付き再現可能) ──
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ── 分野別テンプレート ──

interface QTemplate {
  generate: (rng: () => number, idx: number) => SampleQuestion;
}

// ====== 数学IA: 数と式 ======
const m1a_suushiki_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const a = randInt(rng, 2, 9);
      const b = randInt(rng, 2, 9);
      const product = a * a * b;
      const correct = `${a}√${b}`;
      const wrongs = [`${b}√${a}`, `${a + 1}√${b}`, `${a}√${b + 1}`];
      return makeQ(`ms_g${idx}`, `√${product} を最も簡単な形に変形せよ。`, 1, correct, wrongs,
        `√${product} = √(${a}²×${b}) = ${a}√${b}。根号の中の平方因数を外に出す。`);
    },
  },
  {
    generate: (rng, idx) => {
      const a = randInt(rng, 1, 5);
      const b = randInt(rng, 1, 8);
      const c = randInt(rng, 1, 5);
      const d = randInt(rng, 1, 8);
      // ax + b > cx + d → (a-c)x > d-b
      const diff = a - c;
      const rhs = d - b;
      let answer: string;
      if (diff > 0) answer = `x > ${rhs / diff}`;
      else if (diff < 0) answer = `x < ${rhs / diff}`;
      else return makeQ(`ms_g${idx}`, `${a}x + ${b} > ${c}x + ${d} を解け (a=c の特殊ケース)。`, 2,
        rhs > 0 ? "解なし" : "すべての実数", ["x > 0", "x < 0", "x = 0"],
        `${a}x + ${b} > ${c}x + ${d} → 0·x > ${rhs}。${rhs > 0 ? "これは常に偽なので解なし" : "常に成り立つのですべての実数"}`);
      const ans = Math.round((rhs / diff) * 100) / 100;
      const sign = diff > 0 ? ">" : "<";
      return makeQ(`ms_g${idx}`, `不等式 ${a}x + ${b} > ${c}x + ${d} を解け。`, 2,
        `x ${sign} ${ans}`,
        [`x ${sign === ">" ? "<" : ">"} ${ans}`, `x ${sign} ${ans + 1}`, `x ${sign} ${-ans}`],
        `${a}x - ${c}x > ${d} - ${b} → ${diff}x > ${rhs}${diff < 0 ? "。負の数で割ると不等号逆転" : ""} → x ${sign} ${ans}。`);
    },
  },
  {
    generate: (rng, idx) => {
      const r1 = randInt(rng, -9, 9);
      const r2 = randInt(rng, -9, 9);
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
      const cStr = c >= 0 ? `+ ${c}` : `- ${-c}`;
      const f1 = r1 >= 0 ? `(x - ${r1})` : `(x + ${-r1})`;
      const f2 = r2 >= 0 ? `(x - ${r2})` : `(x + ${-r2})`;
      const correct = r1 === r2 ? `${f1}²` : `${f1}${f2}`;
      return makeQ(`ms_g${idx}`, `x² ${bStr}x ${cStr} を因数分解せよ。`, 1, correct,
        [`(x + ${r1})(x + ${r2 + 1})`, `(x + ${r1 + 1})(x + ${r2})`, `(x - ${r1})(x + ${r2})`],
        `2数の和が${-b}、積が${c}となる組 (${-r1}, ${-r2}) を見つける。x² ${bStr}x ${cStr} = ${correct}。`);
    },
  },
];

// ====== 数学IA: 2次関数 ======
const m1a_niji_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const h = randInt(rng, -5, 5);
      const k = randInt(rng, -8, 8);
      const b = -2 * h;
      const c = h * h + k;
      const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
      const cStr = c >= 0 ? `+ ${c}` : `- ${-c}`;
      return makeQ(`mn_g${idx}`, `y = x² ${bStr}x ${cStr} の頂点の座標を求めよ。`, 2,
        `(${h}, ${k})`, [`(${-h}, ${k})`, `(${h}, ${-k})`, `(${h + 1}, ${k})`],
        `平方完成: y = (x - ${h})² + ${k}。頂点は (${h}, ${k})。`);
    },
  },
  {
    generate: (rng, idx) => {
      const r1 = randInt(rng, 1, 8);
      const r2 = randInt(rng, r1 + 1, 12);
      const sum = r1 + r2;
      const prod = r1 * r2;
      return makeQ(`mn_g${idx}`, `2次方程式 x² - ${sum}x + ${prod} = 0 の2つの解の和と積をそれぞれ求めよ。`, 1,
        `和: ${sum}, 積: ${prod}`, [`和: ${prod}, 積: ${sum}`, `和: ${-sum}, 積: ${prod}`, `和: ${sum}, 積: ${-prod}`],
        `解と係数の関係より、和 = ${sum}、積 = ${prod}。実際に因数分解すると (x-${r1})(x-${r2})=0。`);
    },
  },
];

// ====== 数学IIBC: 微分・積分 ======
const m2bc_bibun_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const a = randInt(rng, 1, 5);
      const b = randInt(rng, -6, 6);
      const c = randInt(rng, -9, 9);
      const da = 3 * a;
      const db = 2 * b;
      const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
      const cStr = c >= 0 ? `+ ${c}` : `- ${-c}`;
      const dbStr = db >= 0 ? `+ ${db}` : `- ${-db}`;
      return makeQ(`bb_g${idx}`, `f(x) = ${a}x³ ${bStr}x² ${cStr} の導関数 f'(x) を求めよ。`, 1,
        `${da}x² ${dbStr}x`, [`${da}x² ${bStr}x`, `${a}x² ${dbStr}x ${cStr}`, `${da}x² ${dbStr}x ${cStr}`],
        `(${a}x³)' = ${da}x², (${b}x²)' = ${db}x, (${c})' = 0。f'(x) = ${da}x² ${dbStr}x。`);
    },
  },
  {
    generate: (rng, idx) => {
      const a = randInt(rng, 1, 5);
      const b = randInt(rng, -5, 5);
      const upper = randInt(rng, 1, 5);
      // ∫₀ⁿ (ax + b) dx = [ax²/2 + bx]₀ⁿ = a*n²/2 + b*n
      const result = a * upper * upper / 2 + b * upper;
      const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
      return makeQ(`bb_g${idx}`, `∫₀${upper === 1 ? "¹" : `^${upper}`} (${a}x ${bStr}) dx の値を求めよ。`, 2,
        `${result}`, [`${result + a}`, `${result - b}`, `${Math.abs(result) + 1}`],
        `∫₀${upper}(${a}x ${bStr})dx = [${a}x²/2 ${bStr}x]₀${upper} = ${a}·${upper}²/2 ${bStr}·${upper} = ${result}。`);
    },
  },
];

// ====== 物理: 力学 ======
const phys_rikigaku_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const m = randInt(rng, 1, 10);
      const f = randInt(rng, 2, 20);
      const a = Math.round((f / m) * 100) / 100;
      return makeQ(`pr_g${idx}`, `質量 ${m}.0 kg の物体に ${f}.0 N の力を加えたときの加速度は何 m/s² か。`, 1,
        `${a} m/s²`, [`${f * m} m/s²`, `${Math.round(m / f * 100) / 100} m/s²`, `${a + 1} m/s²`],
        `F = ma → a = F/m = ${f}.0/${m}.0 = ${a} m/s²。`);
    },
  },
  {
    generate: (rng, idx) => {
      const h = randInt(rng, 1, 8) * 5; // 5, 10, ..., 40
      const t = Math.sqrt(2 * h / 10);
      const tRound = Math.round(t * 10) / 10;
      return makeQ(`pr_g${idx}`, `高さ ${h} m から自由落下する物体が地面に達するまでの時間は約何秒か。(g = 10 m/s²)`, 2,
        `${tRound} 秒`, [`${tRound * 2} 秒`, `${Math.round(tRound / 2 * 10) / 10} 秒`, `${tRound + 1} 秒`],
        `h = (1/2)gt² → t = √(2h/g) = √(2×${h}/10) = √${2 * h / 10} ≈ ${tRound} 秒。`);
    },
  },
  {
    generate: (rng, idx) => {
      const f = randInt(rng, 2, 20);
      const d = randInt(rng, 1, 10);
      const w = f * d;
      return makeQ(`pr_g${idx}`, `水平面上で ${f} N の力で物体を ${d}.0 m 動かしたとき、力がした仕事は何 J か。`, 1,
        `${w} J`, [`${f + d} J`, `${w * 2} J`, `${Math.round(w / 2)} J`],
        `W = Fd = ${f} × ${d}.0 = ${w} J。力と移動方向が同じなので cos 0° = 1。`);
    },
  },
];

// ====== 化学: 理論化学 ======
const chem_riron_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const conc = pick(rng, [0.05, 0.10, 0.20, 0.25, 0.50]);
      const vol = pick(rng, [100, 200, 250, 500]);
      const mol = conc * vol / 1000;
      const solute = pick(rng, ["NaOH", "HCl", "NaCl", "KOH"]);
      return makeQ(`cr_g${idx}`, `${conc} mol/L の ${solute} 水溶液 ${vol} mL に含まれる ${solute} の物質量は何 mol か。`, 1,
        `${mol} mol`, [`${conc} mol`, `${vol / 1000} mol`, `${mol * 10} mol`],
        `n = C × V = ${conc} × ${vol / 1000} = ${mol} mol。体積を L に変換すること。`);
    },
  },
  {
    generate: (rng, idx) => {
      const ph = randInt(rng, 1, 6);
      const conc = Math.pow(10, -ph);
      const concStr = `1.0 × 10⁻${ph}`;
      return makeQ(`cr_g${idx}`, `pH = ${ph} の水溶液の水素イオン濃度は何 mol/L か。`, 2,
        `${concStr} mol/L`, [`${ph}.0 mol/L`, `1.0 × 10⁻${ph + 1} mol/L`, `1.0 × 10${ph} mol/L`],
        `pH = -log[H⁺] → [H⁺] = 10⁻ᵖᴴ = 10⁻${ph} = ${concStr} mol/L。`);
    },
  },
];

// ====== 英語R: 語彙・文法 ======
const engr_vocab_pool = [
  { word: "reluctant", meaning: "気が進まない", correct: "unwilling", wrongs: ["eager", "confident", "generous"] },
  { word: "elaborate", meaning: "精巧な、詳細な", correct: "detailed", wrongs: ["simple", "brief", "rough"] },
  { word: "anticipate", meaning: "予期する", correct: "expect", wrongs: ["ignore", "forget", "deny"] },
  { word: "sufficient", meaning: "十分な", correct: "enough", wrongs: ["lacking", "excessive", "minimal"] },
  { word: "diminish", meaning: "減少する", correct: "decrease", wrongs: ["increase", "maintain", "expand"] },
  { word: "consecutive", meaning: "連続した", correct: "successive", wrongs: ["random", "alternate", "scattered"] },
  { word: "ambiguous", meaning: "あいまいな", correct: "unclear", wrongs: ["obvious", "certain", "definite"] },
  { word: "inevitable", meaning: "避けられない", correct: "unavoidable", wrongs: ["optional", "unlikely", "preventable"] },
  { word: "substantial", meaning: "かなりの", correct: "considerable", wrongs: ["tiny", "negligible", "slight"] },
  { word: "compatible", meaning: "互換性のある", correct: "consistent", wrongs: ["conflicting", "opposing", "incompatible"] },
  { word: "preliminary", meaning: "予備の", correct: "initial", wrongs: ["final", "concluding", "ultimate"] },
  { word: "comprehensive", meaning: "包括的な", correct: "thorough", wrongs: ["partial", "limited", "narrow"] },
  { word: "prominent", meaning: "著名な", correct: "notable", wrongs: ["unknown", "ordinary", "hidden"] },
  { word: "feasible", meaning: "実行可能な", correct: "practical", wrongs: ["impossible", "imaginary", "abstract"] },
  { word: "fluctuate", meaning: "変動する", correct: "vary", wrongs: ["stabilize", "fix", "freeze"] },
];

const engr_q1_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const item = pick(rng, engr_vocab_pool);
      return makeQ(`er1_g${idx}`,
        `Which is closest in meaning to the underlined word?\n\nThe data shows a ${item.word} pattern in consumer behavior.`,
        2, item.correct, item.wrongs,
        `${item.word} = ${item.meaning}。最も近い意味は ${item.correct}。`);
    },
  },
];

// ====== 情報I: プログラミング ======
const info_comp_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const start = randInt(rng, 0, 3);
      const end = randInt(rng, start + 3, start + 7);
      let sum = 0;
      for (let i = start; i < end; i++) sum += i;
      return makeQ(`ic_g${idx}`,
        `次のプログラムの出力結果として正しいものはどれか。\n\nx = 0\nfor i in range(${start}, ${end}):\n    x = x + i\nprint(x)`,
        2, `${sum}`, [`${sum + end}`, `${sum - start}`, `${end * start}`],
        `range(${start}, ${end}) は ${start} から ${end - 1} を生成。合計 = ${sum}。range の終端は含まない。`);
    },
  },
  {
    generate: (rng, idx) => {
      const n = randInt(rng, 3, 8);
      const arr = Array.from({ length: n }, () => randInt(rng, 1, 20));
      const maxVal = Math.max(...arr);
      return makeQ(`ic_g${idx}`,
        `次のプログラムの出力として正しいものはどれか。\n\ndata = [${arr.join(", ")}]\nresult = data[0]\nfor x in data:\n    if x > result:\n        result = x\nprint(result)`,
        2, `${maxVal}`, [`${arr[0]}`, `${arr[arr.length - 1]}`, `${arr.reduce((a, b) => a + b, 0)}`],
        `配列の最大値を求めるアルゴリズム。各要素を順にresultと比較し、大きければ更新。最大値は${maxVal}。`);
    },
  },
];

// ── 全分野のテンプレートマッピング ──
const TEMPLATES: Record<string, QTemplate[]> = {
  m1a_suushiki: m1a_suushiki_templates,
  m1a_niji: m1a_niji_templates,
  m2bc_bibun: m2bc_bibun_templates,
  phys_rikigaku: phys_rikigaku_templates,
  chem_riron: chem_riron_templates,
  engr_q1: engr_q1_templates,
  info_comp: info_comp_templates,
};

// ── ヘルパー ──
function makeQ(id: string, body: string, difficulty: number, correct: string, wrongs: string[], explanation: string): SampleQuestion {
  return {
    id,
    body,
    difficulty,
    choices: [
      { id: `${id}a`, label: "1", body: correct, isCorrect: true },
      { id: `${id}b`, label: "2", body: wrongs[0], isCorrect: false },
      { id: `${id}c`, label: "3", body: wrongs[1], isCorrect: false },
      { id: `${id}d`, label: "4", body: wrongs[2], isCorrect: false },
    ],
    explanation,
  };
}

/**
 * 指定分野の追加問題を生成する
 * テンプレートがある分野のみ生成。ない分野は空配列。
 */
export function generateExtraQuestions(fieldId: string, count: number): SampleQuestion[] {
  const templates = TEMPLATES[fieldId];
  if (!templates || templates.length === 0) return [];

  const questions: SampleQuestion[] = [];
  const rng = seededRng(fieldId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));

  for (let i = 0; i < count; i++) {
    const tmpl = templates[i % templates.length];
    const q = tmpl.generate(rng, i);
    // 選択肢をシャッフル
    q.choices = shuffle(rng, q.choices);
    // ラベルを振り直し
    q.choices.forEach((c, j) => { c.label = String(j + 1); });
    questions.push(q);
  }

  return questions;
}

/**
 * 手書き問題 + 自動生成問題を合算して返す
 * 目標: 各分野最低20問
 */
export function getFieldQuestions(fieldId: string, handwritten: SampleQuestion[]): SampleQuestion[] {
  const target = 20;
  if (handwritten.length >= target) return handwritten;
  const extra = generateExtraQuestions(fieldId, target - handwritten.length);
  return [...handwritten, ...extra];
}
