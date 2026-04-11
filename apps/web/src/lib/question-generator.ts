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

// ====== 数学IA: 場合の数・確率 ======
const m1a_jougo_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const n = randInt(rng, 5, 9);
      const r = randInt(rng, 2, 4);
      // nPr
      let perm = 1;
      for (let i = 0; i < r; i++) perm *= (n - i);
      return makeQ(`mj_g${idx}`, `${n}人の中から${r}人を選んで1列に並べる方法は何通りか。`, 2,
        `${perm}通り`, [`${n * r}通り`, `${perm + n}通り`, `${Math.round(perm / 2)}通り`],
        `${n}P${r} = ${Array.from({ length: r }, (_, i) => n - i).join("×")} = ${perm}通り。`);
    },
  },
  {
    generate: (rng, idx) => {
      const n = randInt(rng, 5, 10);
      const r = randInt(rng, 2, 4);
      // nCr
      let num = 1, den = 1;
      for (let i = 0; i < r; i++) { num *= (n - i); den *= (i + 1); }
      const comb = num / den;
      return makeQ(`mj_g${idx}`, `${n}個の中から${r}個を選ぶ組合せは何通りか。`, 2,
        `${comb}通り`, [`${comb + r}通り`, `${comb * 2}通り`, `${n * r}通り`],
        `${n}C${r} = ${n}!/(${r}!×${n - r}!) = ${comb}通り。`);
    },
  },
  {
    generate: (rng, idx) => {
      const total = randInt(rng, 4, 8);
      const red = randInt(rng, 1, total - 1);
      const white = total - red;
      const draw = 2;
      let totalC = 1, redC = 1;
      for (let i = 0; i < draw; i++) { totalC *= (total - i); redC *= (red - i); }
      totalC /= 2; redC = red >= 2 ? redC / 2 : 0;
      const prob = redC > 0 ? `${redC}/${totalC}` : `0`;
      return makeQ(`mj_g${idx}`,
        `赤玉${red}個、白玉${white}個が入った袋から2個同時に取り出すとき、2個とも赤玉である確率を求めよ。`, 3,
        prob,
        [`${red}/${total}`, `${Math.max(1, redC - 1)}/${totalC}`, `${Math.min(redC + 1, totalC)}/${totalC}`],
        `${red}C2/${total}C2 = ${redC}/${totalC}。`);
    },
  },
];

// ====== 数学IA: 図形と計量 ======
const m1a_zukei_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const angles = [30, 45, 60, 90, 120, 135, 150];
      const deg = pick(rng, angles);
      const sinVals: Record<number, string> = { 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1", 120: "√3/2", 135: "√2/2", 150: "1/2" };
      const cosVals: Record<number, string> = { 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0", 120: "-1/2", 135: "-√2/2", 150: "-√3/2" };
      const askSin = rng() > 0.5;
      const correct = askSin ? sinVals[deg] : cosVals[deg];
      const other = askSin ? cosVals[deg] : sinVals[deg];
      return makeQ(`mz_g${idx}`, `${askSin ? "sin" : "cos"} ${deg}° の値を求めよ。`, 1,
        correct, [other, "0", "-1"],
        `${askSin ? "sin" : "cos"} ${deg}° = ${correct}。単位円上の座標から読み取る。`);
    },
  },
  {
    generate: (rng, idx) => {
      const a = randInt(rng, 3, 10);
      const b = randInt(rng, 3, 10);
      const C = pick(rng, [60, 90, 120]);
      const cosC: Record<number, number> = { 60: 0.5, 90: 0, 120: -0.5 };
      const c2 = a * a + b * b - 2 * a * b * cosC[C];
      const c = Math.round(Math.sqrt(c2) * 100) / 100;
      return makeQ(`mz_g${idx}`,
        `三角形で a=${a}, b=${b}, C=${C}° のとき、余弦定理より c² の値を求めよ。`, 2,
        `${c2}`, [`${a * a + b * b}`, `${c2 + a}`, `${Math.abs(c2 - b)}`],
        `c² = a² + b² - 2ab cos C = ${a}² + ${b}² - 2×${a}×${b}×${cosC[C]} = ${c2}。`);
    },
  },
];

// ====== 数学IA: データ分析 ======
const m1a_data_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const n = 5;
      const data = Array.from({ length: n }, () => randInt(rng, 10, 50));
      data.sort((a, b) => a - b);
      const median = data[2];
      const mean = Math.round(data.reduce((s, v) => s + v, 0) / n * 10) / 10;
      return makeQ(`md_g${idx}`,
        `データ {${data.join(", ")}} の中央値を求めよ。`, 1,
        `${median}`, [`${mean}`, `${data[1]}`, `${data[3]}`],
        `5個のデータを小さい順に並べたとき、3番目の値 ${median} が中央値。`);
    },
  },
  {
    generate: (rng, idx) => {
      const n = 4;
      const data = Array.from({ length: n }, () => randInt(rng, 5, 30));
      const mean = data.reduce((s, v) => s + v, 0) / n;
      const variance = Math.round(data.reduce((s, v) => s + (v - mean) ** 2, 0) / n * 100) / 100;
      return makeQ(`md_g${idx}`,
        `データ {${data.join(", ")}} の分散を求めよ（平均: ${mean}）。`, 3,
        `${variance}`, [`${Math.round(variance * 2 * 100) / 100}`, `${Math.round(Math.sqrt(variance) * 100) / 100}`, `${Math.round(variance / 2 * 100) / 100}`],
        `分散 = Σ(xi - x̄)²/n = ${variance}。各データと平均の差の2乗の平均。`);
    },
  },
];

// ====== 数学IA: 図形の性質 ======
const m1a_seishitsu_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      // 方べきの定理
      const pa = randInt(rng, 2, 8);
      const pb = randInt(rng, 2, 8);
      const pc = randInt(rng, 2, 8);
      const pd = Math.round(pa * pb / pc * 100) / 100;
      return makeQ(`ms2_g${idx}`,
        `円の2つの弦が点Pで交わり、PA=${pa}, PB=${pb}, PC=${pc}のとき、PDの長さを求めよ。`, 3,
        `${pd}`, [`${pa + pb}`, `${pc * 2}`, `${Math.round(pd + 1)}`],
        `方べきの定理: PA×PB = PC×PD → ${pa}×${pb} = ${pc}×PD → PD = ${pd}。`);
    },
  },
];

// ====== 数学IIBC: 数列 ======
const m2bc_suuretsu_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const a1 = randInt(rng, 1, 10);
      const d = randInt(rng, 1, 5);
      const n = randInt(rng, 5, 15);
      const an = a1 + (n - 1) * d;
      const sum = n * (a1 + an) / 2;
      return makeQ(`sr_g${idx}`,
        `初項${a1}, 公差${d}の等差数列の第${n}項までの和を求めよ。`, 2,
        `${sum}`, [`${an * n}`, `${sum + d}`, `${a1 * n}`],
        `a${n} = ${a1} + ${n - 1}×${d} = ${an}。S${n} = ${n}(${a1}+${an})/2 = ${sum}。`);
    },
  },
  {
    generate: (rng, idx) => {
      const a1 = randInt(rng, 1, 5);
      const r = pick(rng, [2, 3, -2]);
      const n = randInt(rng, 3, 6);
      const an = a1 * Math.pow(r, n - 1);
      return makeQ(`sr_g${idx}`,
        `初項${a1}, 公比${r}の等比数列の第${n}項を求めよ。`, 2,
        `${an}`, [`${a1 * r * n}`, `${an + a1}`, `${a1 * n}`],
        `a${n} = ${a1}×${r}^${n - 1} = ${an}。`);
    },
  },
];

// ====== 数学IIBC: ベクトル ======
const m2bc_vector_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const ax = randInt(rng, -5, 5);
      const ay = randInt(rng, -5, 5);
      const bx = randInt(rng, -5, 5);
      const by = randInt(rng, -5, 5);
      const dot = ax * bx + ay * by;
      return makeQ(`vc_g${idx}`,
        `ベクトル a=(${ax}, ${ay}), b=(${bx}, ${by}) の内積 a・b を求めよ。`, 2,
        `${dot}`, [`${ax * bx - ay * by}`, `${dot + ax}`, `${ax * by + ay * bx}`],
        `a・b = ${ax}×${bx} + ${ay}×${by} = ${ax * bx} + ${ay * by} = ${dot}。`);
    },
  },
  {
    generate: (rng, idx) => {
      const ax = randInt(rng, 1, 6);
      const ay = randInt(rng, 1, 6);
      const mag = Math.round(Math.sqrt(ax * ax + ay * ay) * 100) / 100;
      return makeQ(`vc_g${idx}`,
        `ベクトル a=(${ax}, ${ay}) の大きさ |a| を求めよ。`, 1,
        `√${ax * ax + ay * ay}`, [`${ax + ay}`, `√${ax * ay}`, `${mag + 1}`],
        `|a| = √(${ax}² + ${ay}²) = √${ax * ax + ay * ay}。`);
    },
  },
];

// ====== 数学IIBC: 三角・指数対数 ======
const m2bc_kansuu_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const base = pick(rng, [2, 3, 5, 10]);
      const exp = randInt(rng, 2, 5);
      const val = Math.pow(base, exp);
      return makeQ(`kn_g${idx}`,
        `log_${base} ${val} の値を求めよ。`, 1,
        `${exp}`, [`${exp + 1}`, `${base}`, `${exp - 1}`],
        `${base}^${exp} = ${val} より log_${base} ${val} = ${exp}。`);
    },
  },
  {
    generate: (rng, idx) => {
      const a = pick(rng, [2, 3, 4, 5]);
      const b = pick(rng, [2, 3, 4]);
      const result = a * b;
      return makeQ(`kn_g${idx}`,
        `log₂ ${a} + log₂ ${b} を簡単にせよ。`, 1,
        `log₂ ${result}`, [`log₂ ${a + b}`, `log₂ ${a} × log₂ ${b}`, `${a + b}`],
        `log₂ ${a} + log₂ ${b} = log₂(${a}×${b}) = log₂ ${result}。対数の加法は真数の積。`);
    },
  },
];

// ====== 数学IIBC: 式と証明 ======
const m2bc_shiki_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const a = randInt(rng, 1, 5);
      const b = randInt(rng, 1, 5);
      // (a+bi)(a-bi) = a²+b²
      const result = a * a + b * b;
      return makeQ(`sk_g${idx}`,
        `複素数 z = ${a} + ${b}i の |z|² を求めよ。`, 2,
        `${result}`, [`${a * b}`, `${a + b}`, `${result + 1}`],
        `|z|² = ${a}² + ${b}² = ${result}。複素数の絶対値の2乗は実部²+虚部²。`);
    },
  },
];

// ====== 数学IIBC: 統計的推測 ======
const m2bc_toukei_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const n = pick(rng, [100, 200, 400]);
      const p = pick(rng, [0.3, 0.4, 0.5, 0.6]);
      const mean = n * p;
      const variance = n * p * (1 - p);
      return makeQ(`tk_g${idx}`,
        `X ~ B(${n}, ${p}) のとき E(X) と V(X) を求めよ。`, 2,
        `E(X)=${mean}, V(X)=${variance}`,
        [`E(X)=${variance}, V(X)=${mean}`, `E(X)=${mean}, V(X)=${mean * p}`, `E(X)=${n}, V(X)=${p}`],
        `二項分布 B(n,p) で E(X)=np=${mean}, V(X)=np(1-p)=${variance}。`);
    },
  },
];

// ====== 国語: 古文 ======
const kokugo_kobun_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { word: "あはれなり", meaning: "しみじみと心が動かされるさまだ", wrongs: ["かわいい", "美しい", "悲しい"] },
        { word: "をかし", meaning: "趣がある・興味深い", wrongs: ["おかしい・滑稽だ", "美しい", "悲しい"] },
        { word: "いとほし", meaning: "気の毒だ・かわいそうだ", wrongs: ["いとしい・愛おしい", "恥ずかしい", "憎らしい"] },
        { word: "めでたし", meaning: "すばらしい・立派だ", wrongs: ["めでたい・祝うべきだ", "珍しい", "かわいい"] },
        { word: "やむごとなし", meaning: "高貴である・格別だ", wrongs: ["仕方がない", "やめられない", "落ち着かない"] },
        { word: "あやし", meaning: "不思議だ・身分が低い", wrongs: ["危ない", "怪しい(疑わしい)", "恥ずかしい"] },
        { word: "つれづれなり", meaning: "退屈だ・することがない", wrongs: ["冷淡だ", "連続している", "仲が良い"] },
        { word: "こころもとなし", meaning: "待ち遠しい・気がかりだ", wrongs: ["心がない", "情けない", "安心だ"] },
      ];
      const item = pick(rng, items);
      return makeQ(`kk_g${idx}`,
        `古語「${item.word}」の意味として最も適切なものを選べ。`, 2,
        item.meaning, item.wrongs,
        `「${item.word}」は古文で「${item.meaning}」の意味。現代語の語感と異なるので注意。`);
    },
  },
  {
    generate: (rng, idx) => {
      const items = [
        { aux: "む", setsuzoku: "未然形", meaning: "推量・意志・勧誘", wrongs: ["連用形", "已然形", "終止形"] },
        { aux: "けり", setsuzoku: "連用形", meaning: "過去・詠嘆", wrongs: ["未然形", "終止形", "連体形"] },
        { aux: "ず", setsuzoku: "未然形", meaning: "打消", wrongs: ["連用形", "終止形", "已然形"] },
        { aux: "たり", setsuzoku: "連用形", meaning: "完了・存続", wrongs: ["未然形", "終止形", "連体形"] },
        { aux: "べし", setsuzoku: "終止形", meaning: "推量・当然・可能", wrongs: ["未然形", "連用形", "連体形"] },
        { aux: "る・らる", setsuzoku: "未然形", meaning: "受身・尊敬・自発・可能", wrongs: ["連用形", "終止形", "已然形"] },
      ];
      const item = pick(rng, items);
      return makeQ(`kk_g${idx}`,
        `助動詞「${item.aux}」の接続（直前の活用形）として正しいものを選べ。`, 3,
        item.setsuzoku, item.wrongs,
        `「${item.aux}」(${item.meaning})は${item.setsuzoku}に接続する。`);
    },
  },
];

// ====== 国語: 漢文 ======
const kokugo_kanbun_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { pattern: "不〜", reading: "〜ず", meaning: "〜しない(単純否定)", wrongs: ["〜できない", "〜させない", "〜しないではいられない"] },
        { pattern: "未〜", reading: "いまだ〜ず", meaning: "まだ〜していない", wrongs: ["〜しない", "〜できない", "〜すべきでない"] },
        { pattern: "無〜", reading: "〜なし", meaning: "〜がない", wrongs: ["〜しない", "〜できない", "〜してはならない"] },
        { pattern: "使A〜", reading: "Aをして〜しむ", meaning: "Aに〜させる(使役)", wrongs: ["Aが〜する", "Aを〜とする", "Aに〜される"] },
        { pattern: "被〜", reading: "〜せらる", meaning: "〜される(受身)", wrongs: ["〜させる", "〜できる", "〜すべきだ"] },
        { pattern: "何〜", reading: "なんぞ〜", meaning: "どうして〜か(反語)", wrongs: ["何を〜する", "〜しなさい", "〜すべきだ"] },
      ];
      const item = pick(rng, items);
      return makeQ(`kb_g${idx}`,
        `漢文の句形「${item.pattern}」（${item.reading}）の意味として最も適切なものを選べ。`, 2,
        item.meaning, item.wrongs,
        `「${item.pattern}」は「${item.reading}」と読み、「${item.meaning}」の意味。`);
    },
  },
];

// ====== 国語: 現代文 ======
const kokugo_gendai_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { term: "演繹", meaning: "一般的原理から個別の結論を導く推論方法", wrongs: ["個別の事実から一般法則を導く推論方法", "類似した事例から推測する方法", "直感的に結論を得る方法"] },
        { term: "帰納", meaning: "個別の事実から一般的な法則を導く推論方法", wrongs: ["一般原理から個別の結論を導く推論方法", "仮説を立てて検証する方法", "対比によって真理を見出す方法"] },
        { term: "二項対立", meaning: "二つの概念を対比的に捉える思考の枠組み", wrongs: ["二つの選択肢から一つを選ぶこと", "二つの命題が両方成立すること", "二つの概念を統合すること"] },
        { term: "逆説(パラドックス)", meaning: "一見矛盾するように見えて真理を含む表現", wrongs: ["論理的に正しい推論", "反対の立場からの反論", "事実に基づかない主張"] },
        { term: "アナロジー", meaning: "類推・類比。異なる事象間の類似性に基づく推論", wrongs: ["分析・分解して考える方法", "数値データに基づく推論", "歴史的事例の引用"] },
      ];
      const item = pick(rng, items);
      return makeQ(`kg_g${idx}`,
        `評論文で使われる用語「${item.term}」の意味として最も適切なものを選べ。`, 2,
        item.meaning, item.wrongs,
        `「${item.term}」は「${item.meaning}」。評論読解の基本概念。`);
    },
  },
];

// ====== 物理: 波動 ======
const phys_hadou_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const f = pick(rng, [100, 200, 250, 500, 1000]);
      const v = 340;
      const lambda = Math.round(v / f * 1000) / 1000;
      return makeQ(`ph_g${idx}`,
        `振動数 ${f} Hz の音波の波長は何 m か。(音速 340 m/s)`, 1,
        `${lambda} m`, [`${f / v} m`, `${v * f} m`, `${lambda + 0.5} m`],
        `λ = v/f = 340/${f} = ${lambda} m。`);
    },
  },
  {
    generate: (rng, idx) => {
      const f1 = randInt(rng, 400, 450);
      const f2 = randInt(rng, 451, 500);
      const beat = f2 - f1;
      return makeQ(`ph_g${idx}`,
        `振動数 ${f1} Hz と ${f2} Hz の音叉を同時に鳴らしたとき、うなりの振動数は何 Hz か。`, 1,
        `${beat} Hz`, [`${f1 + f2} Hz`, `${Math.round((f1 + f2) / 2)} Hz`, `${beat + 2} Hz`],
        `うなりの振動数 = |f₁ - f₂| = |${f1} - ${f2}| = ${beat} Hz。`);
    },
  },
];

// ====== 物理: 熱力学 ======
const phys_netsuri_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const m = pick(rng, [0.5, 1.0, 2.0, 5.0]);
      const c = 4.2; // 水の比熱 kJ/(kg·K)
      const dt = randInt(rng, 5, 30);
      const Q = Math.round(m * c * dt * 10) / 10;
      return makeQ(`pn_g${idx}`,
        `質量 ${m} kg の水の温度を ${dt}℃ 上げるのに必要な熱量は何 kJ か。(比熱 4.2 kJ/(kg·K))`, 1,
        `${Q} kJ`, [`${Math.round(m * dt)} kJ`, `${Q * 2} kJ`, `${Math.round(Q / 2)} kJ`],
        `Q = mcΔT = ${m}×4.2×${dt} = ${Q} kJ。`);
    },
  },
  {
    generate: (rng, idx) => {
      const Q = randInt(rng, 100, 500);
      const W = randInt(rng, 20, Q - 10);
      const dU = Q - W;
      return makeQ(`pn_g${idx}`,
        `気体に ${Q} J の熱を加え、気体が外部に ${W} J の仕事をしたとき、内部エネルギーの変化は何 J か。`, 2,
        `${dU} J`, [`${Q + W} J`, `${Q} J`, `${W} J`],
        `熱力学第一法則: ΔU = Q - W = ${Q} - ${W} = ${dU} J。`);
    },
  },
];

// ====== 物理: 電磁気 ======
const phys_denki_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const v = pick(rng, [3, 6, 9, 12]);
      const r = pick(rng, [2, 3, 4, 6]);
      const i = Math.round(v / r * 100) / 100;
      return makeQ(`pd_g${idx}`,
        `${v} V の電源に ${r} Ω の抵抗を接続したとき、流れる電流は何 A か。`, 1,
        `${i} A`, [`${v * r} A`, `${r / v} A`, `${i + 1} A`],
        `オームの法則: I = V/R = ${v}/${r} = ${i} A。`);
    },
  },
  {
    generate: (rng, idx) => {
      const r1 = randInt(rng, 2, 10);
      const r2 = randInt(rng, 2, 10);
      const series = r1 + r2;
      const parallel = Math.round(r1 * r2 / (r1 + r2) * 100) / 100;
      const askSeries = rng() > 0.5;
      return makeQ(`pd_g${idx}`,
        `${r1} Ω と ${r2} Ω の抵抗を${askSeries ? "直列" : "並列"}に接続したときの合成抵抗は何 Ω か。`, 1,
        askSeries ? `${series} Ω` : `${parallel} Ω`,
        askSeries
          ? [`${parallel} Ω`, `${series + r1} Ω`, `${r1 * r2} Ω`]
          : [`${series} Ω`, `${r1} Ω`, `${r2} Ω`],
        askSeries
          ? `直列: R = R₁ + R₂ = ${r1} + ${r2} = ${series} Ω。`
          : `並列: 1/R = 1/${r1} + 1/${r2} → R = ${r1}×${r2}/(${r1}+${r2}) = ${parallel} Ω。`);
    },
  },
];

// ====== 物理: 原子 ======
const phys_genshi_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { name: "光電効果", desc: "金属に光を当てると電子が飛び出す現象", wrongs: ["光が波として干渉する現象", "光が屈折する現象", "電子が光を吸収して振動する現象"] },
        { name: "コンプトン効果", desc: "X線が電子に衝突して波長が長くなる現象", wrongs: ["光が回折する現象", "電子が原子核に吸収される現象", "光の速度が変化する現象"] },
        { name: "ド・ブロイ波", desc: "運動する粒子が持つ波としての性質", wrongs: ["電磁波の一種", "音波の反射現象", "粒子が放射する光"] },
        { name: "ボーアの量子条件", desc: "電子の軌道角運動量が h/2π の整数倍となる条件", wrongs: ["電子のエネルギーが連続的に変化する条件", "原子核が安定する条件", "光の振動数と波長の関係"] },
      ];
      const item = pick(rng, items);
      return makeQ(`pg_g${idx}`,
        `「${item.name}」の説明として最も適切なものを選べ。`, 2,
        item.desc, item.wrongs,
        `${item.name}は「${item.desc}」。量子力学の基礎概念。`);
    },
  },
];

// ====== 化学: 無機化学 ======
const chem_muki_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { ion: "Fe³⁺", reagent: "NaOH水溶液", color: "赤褐色沈殿", wrongs: ["白色沈殿", "青色沈殿", "黄色沈殿"] },
        { ion: "Cu²⁺", reagent: "NaOH水溶液", color: "青白色沈殿", wrongs: ["赤褐色沈殿", "白色沈殿", "黒色沈殿"] },
        { ion: "Al³⁺", reagent: "NaOH水溶液(少量)", color: "白色ゲル状沈殿", wrongs: ["赤褐色沈殿", "青色沈殿", "変化なし"] },
        { ion: "Ag⁺", reagent: "HCl", color: "白色沈殿(AgCl)", wrongs: ["赤褐色沈殿", "変化なし", "青色沈殿"] },
        { ion: "Ba²⁺", reagent: "希硫酸", color: "白色沈殿(BaSO₄)", wrongs: ["赤色沈殿", "変化なし", "黄色沈殿"] },
      ];
      const item = pick(rng, items);
      return makeQ(`cm_g${idx}`,
        `${item.ion} を含む水溶液に${item.reagent}を加えたとき、何が観察されるか。`, 2,
        item.color, item.wrongs,
        `${item.ion} + ${item.reagent} → ${item.color}。系統分析の基本反応。`);
    },
  },
];

// ====== 化学: 有機化学 ======
const chem_yuuki_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { name: "メタノール", formula: "CH₃OH", group: "ヒドロキシ基(-OH)", wrongs: ["カルボキシ基(-COOH)", "アルデヒド基(-CHO)", "アミノ基(-NH₂)"] },
        { name: "酢酸", formula: "CH₃COOH", group: "カルボキシ基(-COOH)", wrongs: ["ヒドロキシ基(-OH)", "カルボニル基(-CO-)", "エステル結合(-COO-)"] },
        { name: "ホルムアルデヒド", formula: "HCHO", group: "アルデヒド基(-CHO)", wrongs: ["ケトン基(-CO-)", "カルボキシ基(-COOH)", "ヒドロキシ基(-OH)"] },
        { name: "アセトン", formula: "CH₃COCH₃", group: "ケトン基(カルボニル基)", wrongs: ["アルデヒド基(-CHO)", "カルボキシ基(-COOH)", "エーテル結合(-O-)"] },
        { name: "ジエチルエーテル", formula: "C₂H₅OC₂H₅", group: "エーテル結合(-O-)", wrongs: ["エステル結合(-COO-)", "ヒドロキシ基(-OH)", "アミノ基(-NH₂)"] },
      ];
      const item = pick(rng, items);
      return makeQ(`cy_g${idx}`,
        `${item.name}(${item.formula})が持つ官能基として正しいものを選べ。`, 2,
        item.group, item.wrongs,
        `${item.name}の官能基は${item.group}。有機化合物の分類の基本。`);
    },
  },
];

// ====== 化学: 高分子 ======
const chem_koubun_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { name: "ポリエチレン", monomer: "エチレン (CH₂=CH₂)", type: "付加重合", wrongs: ["縮合重合", "開環重合", "共重合"] },
        { name: "ナイロン6,6", monomer: "ヘキサメチレンジアミン + アジピン酸", type: "縮合重合", wrongs: ["付加重合", "開環重合", "ラジカル重合"] },
        { name: "PET(ポリエチレンテレフタラート)", monomer: "エチレングリコール + テレフタル酸", type: "縮合重合", wrongs: ["付加重合", "開環重合", "乳化重合"] },
        { name: "ポリ塩化ビニル", monomer: "塩化ビニル (CH₂=CHCl)", type: "付加重合", wrongs: ["縮合重合", "共縮合", "配位重合"] },
        { name: "デンプン", monomer: "α-グルコース", type: "脱水縮合(天然)", wrongs: ["付加重合", "開環重合", "ラジカル重合"] },
      ];
      const item = pick(rng, items);
      return makeQ(`ck_g${idx}`,
        `${item.name}の重合様式として正しいものを選べ。（単量体: ${item.monomer}）`, 2,
        item.type, item.wrongs,
        `${item.name}は${item.monomer}から${item.type}によって生成される。`);
    },
  },
];

// ====== 社会(地理B): 自然環境 ======
const soc_shizen_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { climate: "Af (熱帯雨林気候)", feature: "年中高温多雨、最寒月平均気温18℃以上", wrongs: ["明確な乾季がある", "冬に降水が集中", "年較差が大きい"] },
        { climate: "Cfa (温暖湿潤気候)", feature: "四季が明瞭、夏に高温多湿", wrongs: ["年中乾燥", "冬に乾季がある", "夏が涼しい"] },
        { climate: "Cs (地中海性気候)", feature: "夏に乾燥し冬に雨が多い", wrongs: ["年中多雨", "冬に乾燥する", "夏に雨が多い"] },
        { climate: "Df (亜寒帯湿潤気候)", feature: "冬の寒さが厳しく年較差が大きい", wrongs: ["年中温暖", "乾燥が激しい", "夏がない"] },
        { climate: "BW (砂漠気候)", feature: "年降水量が極めて少なく乾燥", wrongs: ["雨季がある", "冬に多雨", "湿度が高い"] },
      ];
      const item = pick(rng, items);
      return makeQ(`ss_g${idx}`,
        `ケッペンの気候区分「${item.climate}」の特徴として正しいものを選べ。`, 2,
        item.feature, item.wrongs,
        `${item.climate}は「${item.feature}」。ケッペンの気候区分の基本知識。`);
    },
  },
];

// ====== 社会(地理B): 資源と産業 ======
const soc_shigen_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { resource: "原油", top: "アメリカ合衆国", wrongs: ["日本", "ドイツ", "フランス"], note: "生産量1位(2023年時点)" },
        { resource: "鉄鉱石", top: "オーストラリア", wrongs: ["日本", "アメリカ", "ドイツ"], note: "生産量1位" },
        { resource: "石炭", top: "中国", wrongs: ["日本", "フランス", "イタリア"], note: "生産量・消費量とも1位" },
        { resource: "天然ガス", top: "アメリカ合衆国", wrongs: ["日本", "韓国", "フランス"], note: "シェールガス革命により1位" },
        { resource: "小麦", top: "中国", wrongs: ["日本", "韓国", "シンガポール"], note: "世界最大の生産国" },
        { resource: "米", top: "中国", wrongs: ["アメリカ", "フランス", "ブラジル"], note: "世界最大の生産国" },
      ];
      const item = pick(rng, items);
      return makeQ(`sr_g${idx}`,
        `${item.resource}の世界最大の生産国はどこか。`, 2,
        item.top, item.wrongs,
        `${item.resource}の${item.note}は${item.top}。`);
    },
  },
];

// ====== 社会(地理B): 人口・都市 ======
const soc_jinkou_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { concept: "人口転換(人口転換モデル)", meaning: "多産多死→多産少死→少産少死への変化", wrongs: ["人口が一定に保たれること", "都市人口が農村を上回ること", "移民により人口が変化すること"] },
        { concept: "合計特殊出生率", meaning: "1人の女性が生涯に産む子供の平均数", wrongs: ["1年間の出生数を総人口で割った値", "結婚した夫婦の平均子供数", "出生数と死亡数の差"] },
        { concept: "ドーナツ化現象", meaning: "都心の人口が減少し郊外に移動する現象", wrongs: ["都心に人口が集中する現象", "農村から都市への移動", "都市全体の人口が減少する現象"] },
        { concept: "ジェントリフィケーション", meaning: "都市の衰退地区に富裕層が流入し再開発される現象", wrongs: ["郊外のスプロール化", "人口の自然減少", "農村の過疎化"] },
      ];
      const item = pick(rng, items);
      return makeQ(`sj_g${idx}`,
        `「${item.concept}」の説明として最も適切なものを選べ。`, 2,
        item.meaning, item.wrongs,
        `${item.concept}は「${item.meaning}」。地理の人口・都市分野の基本概念。`);
    },
  },
];

// ====== 社会(地理B): 生活文化 ======
const soc_chiiki_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { religion: "イスラム教", region: "中東・北アフリカ・東南アジア一部", feature: "礼拝(1日5回)、ラマダン(断食月)", wrongs: ["輪廻転生を信じる", "三位一体を信じる", "八正道を説く"] },
        { religion: "ヒンドゥー教", region: "インド・ネパール", feature: "カースト制度と輪廻転生の考え", wrongs: ["偶像崇拝を禁止する", "断食月がある", "安息日を守る"] },
        { religion: "仏教", region: "東アジア・東南アジア", feature: "四諦八正道を説き悟りを目指す", wrongs: ["カースト制度がある", "1日5回の礼拝がある", "選民思想がある"] },
        { religion: "キリスト教", region: "ヨーロッパ・南北アメリカ", feature: "聖書を聖典とし、日曜の礼拝がある", wrongs: ["カースト制度がある", "1日5回の礼拝がある", "輪廻転生を信じる"] },
      ];
      const item = pick(rng, items);
      return makeQ(`sc_g${idx}`,
        `${item.religion}(主な分布: ${item.region})の特徴として正しいものを選べ。`, 2,
        item.feature, item.wrongs,
        `${item.religion}は${item.region}に分布し、「${item.feature}」が特徴。`);
    },
  },
];

// ====== 社会(地理B): 地図・地域 ======
const soc_chizu_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { projection: "メルカトル図法", feature: "角度(方位角)が正しく航海に適する", wrongs: ["面積が正しい", "最短距離が直線で表される", "どの場所も歪みがない"] },
        { projection: "モルワイデ図法", feature: "面積が正しい正積図法", wrongs: ["角度が正しい", "距離が正しい", "航海に適する"] },
        { projection: "正距方位図法", feature: "中心からの距離と方位が正しい", wrongs: ["面積が正しい", "角度が正しい", "経線が直線になる"] },
      ];
      const item = pick(rng, items);
      return makeQ(`sz_g${idx}`,
        `「${item.projection}」の特徴として正しいものを選べ。`, 2,
        item.feature, item.wrongs,
        `${item.projection}は「${item.feature}」。地図投影法の基本。`);
    },
  },
];

// ====== 英語R: 上位問 (Q2-Q6用汎用語彙・読解) ======
const engr_reading_pool = [
  { word: "controversial", meaning: "論争的な", correct: "debatable", wrongs: ["agreeable", "definite", "ordinary"] },
  { word: "hypothesis", meaning: "仮説", correct: "theory", wrongs: ["fact", "conclusion", "evidence"] },
  { word: "implication", meaning: "含意・影響", correct: "consequence", wrongs: ["explanation", "introduction", "definition"] },
  { word: "sustainable", meaning: "持続可能な", correct: "maintainable", wrongs: ["temporary", "destructive", "unstable"] },
  { word: "perspective", meaning: "見方・視点", correct: "viewpoint", wrongs: ["conclusion", "fact", "answer"] },
  { word: "significant", meaning: "重要な・有意な", correct: "important", wrongs: ["minor", "casual", "unclear"] },
  { word: "alternative", meaning: "代替の", correct: "substitute", wrongs: ["original", "primary", "identical"] },
  { word: "fundamental", meaning: "基本的な", correct: "essential", wrongs: ["additional", "optional", "secondary"] },
  { word: "phenomenon", meaning: "現象", correct: "occurrence", wrongs: ["theory", "opinion", "prediction"] },
  { word: "simultaneously", meaning: "同時に", correct: "at the same time", wrongs: ["one by one", "eventually", "rarely"] },
];

const engr_q2_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const item = pick(rng, engr_reading_pool);
      return makeQ(`er2_g${idx}`,
        `Choose the word closest in meaning to the underlined word.\n\nThe study revealed a ${item.word} result that challenged existing assumptions.`,
        2, item.correct, item.wrongs,
        `${item.word} = ${item.meaning}。最も近い意味は ${item.correct}。`);
    },
  },
];

const engr_q3_templates: QTemplate[] = [...engr_q2_templates]; // 同じ語彙プールを使用
const engr_q5_templates: QTemplate[] = [...engr_q2_templates];
const engr_q6_templates: QTemplate[] = [...engr_q2_templates];

// ====== 英語L: リスニング (テキストベース練習) ======
const engl_q1_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const scenarios = [
        { q: "Where does the conversation most likely take place?", correct: "At a restaurant", wrongs: ["At a hospital", "At a school", "At a bank"], hint: "May I take your order?" },
        { q: "What will the woman probably do next?", correct: "Go to the library", wrongs: ["Go shopping", "Call a friend", "Take a nap"], hint: "I need to return these books before they're overdue." },
        { q: "What is the man's problem?", correct: "He lost his keys", wrongs: ["He missed the bus", "He forgot his wallet", "He broke his phone"], hint: "I can't find them anywhere. I checked all my pockets." },
        { q: "What does the woman suggest?", correct: "Taking a different route", wrongs: ["Leaving earlier", "Buying a new car", "Calling a taxi"], hint: "Why don't we avoid the highway? It's always jammed at this hour." },
      ];
      const s = pick(rng, scenarios);
      return makeQ(`el1_g${idx}`,
        `[Listening Practice]\nYou hear: "${s.hint}"\n\n${s.q}`, 1,
        s.correct, s.wrongs,
        `ヒントの発言内容から場面や意図を推測する。正解は "${s.correct}"。`);
    },
  },
];
const engl_q5_templates: QTemplate[] = [...engl_q1_templates];
const engl_q6_templates: QTemplate[] = [...engl_q1_templates];

// ====== 情報I: ネットワーク ======
const info_network_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { term: "TCP", desc: "信頼性のある通信を提供するトランスポート層プロトコル", wrongs: ["コネクションレス型の高速プロトコル", "IPアドレスを割り当てるプロトコル", "データを暗号化するプロトコル"] },
        { term: "UDP", desc: "コネクションレス型の軽量なトランスポート層プロトコル", wrongs: ["再送制御を行う信頼性の高いプロトコル", "ルーティングを行うプロトコル", "ファイルを転送するプロトコル"] },
        { term: "DNS", desc: "ドメイン名をIPアドレスに変換する名前解決サービス", wrongs: ["データを暗号化するサービス", "メールを転送するサービス", "ファイルを共有するサービス"] },
        { term: "HTTPS", desc: "TLS/SSLで暗号化されたHTTP通信", wrongs: ["高速なHTTP通信", "圧縮されたHTTP通信", "認証不要のHTTP通信"] },
        { term: "IPアドレス", desc: "ネットワーク上の機器を識別するための番号", wrongs: ["Webページの住所", "メールアドレスの略称", "暗号化の鍵"] },
      ];
      const item = pick(rng, items);
      return makeQ(`in_g${idx}`,
        `「${item.term}」の説明として最も適切なものを選べ。`, 2,
        item.desc, item.wrongs,
        `${item.term}は「${item.desc}」。ネットワークの基本用語。`);
    },
  },
  {
    generate: (rng, idx) => {
      // サブネットマスクの問題
      const masks = [
        { mask: "255.255.255.0", prefix: "/24", hosts: 254 },
        { mask: "255.255.0.0", prefix: "/16", hosts: 65534 },
        { mask: "255.255.255.128", prefix: "/25", hosts: 126 },
      ];
      const m = pick(rng, masks);
      return makeQ(`in_g${idx}`,
        `サブネットマスク ${m.mask} (${m.prefix}) のネットワークで使用可能なホスト数は最大いくつか。`, 3,
        `${m.hosts}`, [`${m.hosts + 2}`, `${m.hosts * 2}`, `256`],
        `${m.prefix} → ホスト部のビット数から 2^n - 2 = ${m.hosts}。ネットワークアドレスとブロードキャストを除く。`);
    },
  },
];

// ====== 情報I: 情報社会 ======
const info_joho_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { law: "個人情報保護法", desc: "個人情報の適正な取扱いを定めた法律", wrongs: ["著作物の権利を保護する法律", "不正アクセスを禁止する法律", "電子商取引を規制する法律"] },
        { law: "著作権法", desc: "著作物の創作者の権利を保護する法律", wrongs: ["個人情報の取扱いを定めた法律", "通信の秘密を守る法律", "不正競争を防止する法律"] },
        { law: "不正アクセス禁止法", desc: "他人のID・パスワードを無断で使用する行為等を禁止する法律", wrongs: ["著作権を保護する法律", "個人情報を保護する法律", "名誉毀損を罰する法律"] },
        { law: "プロバイダ責任制限法", desc: "ネット上の権利侵害における通信事業者の責任範囲を定めた法律", wrongs: ["通信速度の基準を定めた法律", "個人情報の保護を定めた法律", "サイバー犯罪を罰する法律"] },
      ];
      const item = pick(rng, items);
      return makeQ(`ij_g${idx}`,
        `「${item.law}」の説明として最も適切なものを選べ。`, 1,
        item.desc, item.wrongs,
        `${item.law}は「${item.desc}」。情報社会の法規制の基本。`);
    },
  },
];

// ====== 情報I: 情報デザイン ======
const info_comm_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const items = [
        { principle: "近接の法則", desc: "近くに配置された要素は関連があると認識される", wrongs: ["同じ色の要素はグループと認識される", "大きい要素が先に注目される", "閉じた形が優先して認識される"] },
        { principle: "類同の法則", desc: "形・色・サイズが似た要素はグループと認識される", wrongs: ["近くの要素が関連と認識される", "連続した線が優先される", "閉じた領域が図と認識される"] },
        { principle: "ユニバーサルデザイン", desc: "年齢・障害の有無に関わらず誰もが利用できる設計", wrongs: ["特定のユーザー向けに最適化した設計", "最新技術を活用した設計", "コストを最小化する設計"] },
        { principle: "アクセシビリティ", desc: "障害者を含むすべての人が情報にアクセスできること", wrongs: ["情報の検索しやすさ", "Webサイトの表示速度", "データの安全性"] },
      ];
      const item = pick(rng, items);
      return makeQ(`ic2_g${idx}`,
        `「${item.principle}」の説明として最も適切なものを選べ。`, 1,
        item.desc, item.wrongs,
        `${item.principle}は「${item.desc}」。情報デザインの基本原則。`);
    },
  },
];

// ====== 情報I: データ活用 ======
const info_data_templates: QTemplate[] = [
  {
    generate: (rng, idx) => {
      const n = randInt(rng, 4, 8);
      const data = Array.from({ length: n }, () => randInt(rng, 10, 100));
      const mean = Math.round(data.reduce((s, v) => s + v, 0) / n * 10) / 10;
      data.sort((a, b) => a - b);
      const median = n % 2 === 0 ? (data[n / 2 - 1] + data[n / 2]) / 2 : data[Math.floor(n / 2)];
      return makeQ(`id_g${idx}`,
        `データ [${data.join(", ")}] の平均値を求めよ。`, 1,
        `${mean}`, [`${median}`, `${data[0]}`, `${data[n - 1]}`],
        `平均 = (${data.join("+")})/$ = ${data.reduce((s, v) => s + v, 0)}/${n} = ${mean}。`);
    },
  },
  {
    generate: (rng, idx) => {
      const bits = pick(rng, [8, 16, 24, 32]);
      const combinations = Math.pow(2, bits);
      return makeQ(`id_g${idx}`,
        `${bits}ビットで表現できる情報の組合せ数はいくつか。`, 1,
        `${combinations}`, [`${bits * 2}`, `${bits * bits}`, `${combinations / 2}`],
        `nビットで 2^n 通り。2^${bits} = ${combinations}。`);
    },
  },
];

// ── 全分野のテンプレートマッピング ──
const TEMPLATES: Record<string, QTemplate[]> = {
  // 数学IA
  m1a_suushiki: m1a_suushiki_templates,
  m1a_niji: m1a_niji_templates,
  m1a_jougo: m1a_jougo_templates,
  m1a_zukei: m1a_zukei_templates,
  m1a_data: m1a_data_templates,
  m1a_seishitsu: m1a_seishitsu_templates,
  // 数学IIBC
  m2bc_bibun: m2bc_bibun_templates,
  m2bc_suuretsu: m2bc_suuretsu_templates,
  m2bc_vector: m2bc_vector_templates,
  m2bc_kansuu: m2bc_kansuu_templates,
  m2bc_shiki: m2bc_shiki_templates,
  m2bc_toukei: m2bc_toukei_templates,
  // 国語
  kokugo_gendai: kokugo_gendai_templates,
  kokugo_kobun: kokugo_kobun_templates,
  kokugo_kanbun: kokugo_kanbun_templates,
  // 物理
  phys_rikigaku: phys_rikigaku_templates,
  phys_hadou: phys_hadou_templates,
  phys_netsuri: phys_netsuri_templates,
  phys_denki: phys_denki_templates,
  phys_genshi: phys_genshi_templates,
  // 化学
  chem_riron: chem_riron_templates,
  chem_muki: chem_muki_templates,
  chem_yuuki: chem_yuuki_templates,
  chem_koubun: chem_koubun_templates,
  // 英語R
  engr_q1: engr_q1_templates,
  engr_q2: engr_q2_templates,
  engr_q3: engr_q3_templates,
  engr_q5: engr_q5_templates,
  engr_q6: engr_q6_templates,
  // 英語L
  engl_q1: engl_q1_templates,
  engl_q5: engl_q5_templates,
  engl_q6: engl_q6_templates,
  // 社会
  soc_shizen: soc_shizen_templates,
  soc_shigen: soc_shigen_templates,
  soc_jinkou: soc_jinkou_templates,
  soc_chiiki: soc_chiiki_templates,
  soc_chizu: soc_chizu_templates,
  // 情報I
  info_joho: info_joho_templates,
  info_comp: info_comp_templates,
  info_comm: info_comm_templates,
  info_network: info_network_templates,
  info_data: info_data_templates,
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
