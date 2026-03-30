/**
 * 偏差値60 サンプルユーザー・学習データ
 *
 * 偏差値60 ≒ 共通テスト合計 約660/900 (正答率73%前後)
 * 理系なので数学・理科やや高め、国語・社会やや低めのバラつき
 */

export const SAMPLE_USER = {
  id: "sample-user-001",
  displayName: "山田 太郎",
  targetBunrui: "rika1" as const,
  targetTotal: 780,
  examDate: "2027-01-16",
  examYear: 2027,
};

/** 科目別 推定スコア (偏差値60相当) */
export const SAMPLE_SUBJECT_SCORES: Record<string, { score: number; max: number }> = {
  kokugo:     { score: 138, max: 200 }, // 69% — 現代文はまあまあ、古文漢文弱い
  math1a:     { score: 78,  max: 100 }, // 78% — 理系なので高め
  math2bc:    { score: 72,  max: 100 }, // 72% — 微積ベクトルで落とす
  eng_read:   { score: 74,  max: 100 }, // 74%
  eng_listen: { score: 68,  max: 100 }, // 68% — リスニングやや苦手
  physics:    { score: 76,  max: 100 }, // 76%
  chemistry:  { score: 68,  max: 100 }, // 68% — 有機化学が弱い
  social:     { score: 62,  max: 100 }, // 62% — 社会は後回し気味
  info1:      { score: 72,  max: 100 }, // 72%
};

export const SAMPLE_TOTAL_SCORE = Object.values(SAMPLE_SUBJECT_SCORES)
  .reduce((sum, s) => sum + s.score, 0); // = 708

/**
 * 分野別正答データ (ヒートマップ用)
 *
 * points = 共通テストでの配点割合
 * total  = これまでに解いた問題数
 * correct = 正解数
 *
 * 偏差値60の特徴:
 * - 得意分野は80-90%取れる
 * - 苦手分野は40-55%しか取れない
 * - 平均的な分野は65-75%
 */
export interface FieldStat {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  total: number;
  correct: number;
  points: number;
}

export const SAMPLE_FIELD_STATS: FieldStat[] = [
  // ── 国語 (200点) ── 全体69%
  { fieldId: "kokugo_gendai", fieldName: "現代文",  subjectId: "kokugo", total: 40, correct: 32, points: 110 }, // 80%
  { fieldId: "kokugo_kobun",  fieldName: "古文",    subjectId: "kokugo", total: 35, correct: 19, points: 50 },  // 54%
  { fieldId: "kokugo_kanbun", fieldName: "漢文",    subjectId: "kokugo", total: 30, correct: 15, points: 40 },  // 50%

  // ── 数学IA (100点) ── 全体78%
  { fieldId: "m1a_suushiki",  fieldName: "数と式",       subjectId: "math1a", total: 30, correct: 27, points: 15 }, // 90%
  { fieldId: "m1a_niji",      fieldName: "2次関数",      subjectId: "math1a", total: 28, correct: 24, points: 15 }, // 86%
  { fieldId: "m1a_zukei",     fieldName: "図形と計量",   subjectId: "math1a", total: 25, correct: 19, points: 20 }, // 76%
  { fieldId: "m1a_data",      fieldName: "データ分析",   subjectId: "math1a", total: 20, correct: 16, points: 15 }, // 80%
  { fieldId: "m1a_jougo",     fieldName: "場合の数・確率", subjectId: "math1a", total: 35, correct: 21, points: 20 }, // 60%
  { fieldId: "m1a_seishitsu", fieldName: "図形の性質",   subjectId: "math1a", total: 18, correct: 13, points: 15 }, // 72%

  // ── 数学IIBC (100点) ── 全体72%
  { fieldId: "m2bc_shiki",    fieldName: "式と証明",     subjectId: "math2bc", total: 22, correct: 18, points: 15 }, // 82%
  { fieldId: "m2bc_kansuu",   fieldName: "三角・指数対数", subjectId: "math2bc", total: 28, correct: 20, points: 20 }, // 71%
  { fieldId: "m2bc_bibun",    fieldName: "微分・積分",   subjectId: "math2bc", total: 30, correct: 22, points: 20 }, // 73%
  { fieldId: "m2bc_suuretsu", fieldName: "数列",         subjectId: "math2bc", total: 25, correct: 19, points: 15 }, // 76%
  { fieldId: "m2bc_vector",   fieldName: "ベクトル",     subjectId: "math2bc", total: 24, correct: 13, points: 15 }, // 54%
  { fieldId: "m2bc_toukei",   fieldName: "統計的推測",   subjectId: "math2bc", total: 15, correct: 11, points: 15 }, // 73%

  // ── 英語R (100点) ── 全体74%
  { fieldId: "engr_q1", fieldName: "第1問 短文",      subjectId: "eng_read", total: 20, correct: 18, points: 10 }, // 90%
  { fieldId: "engr_q2", fieldName: "第2問 情報検索",   subjectId: "eng_read", total: 20, correct: 17, points: 20 }, // 85%
  { fieldId: "engr_q3", fieldName: "第3問 要旨把握",   subjectId: "eng_read", total: 18, correct: 14, points: 15 }, // 78%
  { fieldId: "engr_q4", fieldName: "第4問 図表",       subjectId: "eng_read", total: 20, correct: 13, points: 16 }, // 65%
  { fieldId: "engr_q5", fieldName: "第5問 物語文",     subjectId: "eng_read", total: 15, correct: 9,  points: 15 }, // 60%
  { fieldId: "engr_q6", fieldName: "第6問 論説文",     subjectId: "eng_read", total: 18, correct: 10, points: 24 }, // 56%

  // ── 英語L (100点) ── 全体68%
  { fieldId: "engl_q1", fieldName: "第1問 短い対話",   subjectId: "eng_listen", total: 20, correct: 18, points: 25 }, // 90%
  { fieldId: "engl_q2", fieldName: "第2問 対話応答",   subjectId: "eng_listen", total: 18, correct: 14, points: 16 }, // 78%
  { fieldId: "engl_q3", fieldName: "第3問 対話概要",   subjectId: "eng_listen", total: 16, correct: 11, points: 18 }, // 69%
  { fieldId: "engl_q4", fieldName: "第4問 モノローグ", subjectId: "eng_listen", total: 16, correct: 9,  points: 12 }, // 56%
  { fieldId: "engl_q5", fieldName: "第5問 講義",       subjectId: "eng_listen", total: 14, correct: 6,  points: 15 }, // 43%
  { fieldId: "engl_q6", fieldName: "第6問 長い対話",   subjectId: "eng_listen", total: 14, correct: 7,  points: 14 }, // 50%

  // ── 物理 (100点) ── 全体76%
  { fieldId: "phys_rikigaku", fieldName: "力学",     subjectId: "physics", total: 35, correct: 30, points: 30 }, // 86%
  { fieldId: "phys_netsuri",  fieldName: "熱力学",   subjectId: "physics", total: 18, correct: 14, points: 15 }, // 78%
  { fieldId: "phys_hadou",    fieldName: "波動",     subjectId: "physics", total: 22, correct: 15, points: 20 }, // 68%
  { fieldId: "phys_denki",    fieldName: "電磁気",   subjectId: "physics", total: 28, correct: 17, points: 25 }, // 61%
  { fieldId: "phys_genshi",   fieldName: "原子",     subjectId: "physics", total: 12, correct: 8,  points: 10 }, // 67%

  // ── 化学 (100点) ── 全体68%
  { fieldId: "chem_riron",  fieldName: "理論化学", subjectId: "chemistry", total: 35, correct: 26, points: 35 }, // 74%
  { fieldId: "chem_muki",   fieldName: "無機化学", subjectId: "chemistry", total: 20, correct: 15, points: 20 }, // 75%
  { fieldId: "chem_yuuki",  fieldName: "有機化学", subjectId: "chemistry", total: 25, correct: 12, points: 30 }, // 48%
  { fieldId: "chem_koubun", fieldName: "高分子",   subjectId: "chemistry", total: 14, correct: 8,  points: 15 }, // 57%

  // ── 社会 (100点) ── 全体62%  (地理B想定、後回し気味)
  { fieldId: "soc_shizen", fieldName: "自然環境",    subjectId: "social", total: 20, correct: 15, points: 20 }, // 75%
  { fieldId: "soc_shigen", fieldName: "資源と産業",  subjectId: "social", total: 18, correct: 11, points: 25 }, // 61%
  { fieldId: "soc_jinkou", fieldName: "人口・都市",  subjectId: "social", total: 15, correct: 8,  points: 20 }, // 53%
  { fieldId: "soc_chiiki", fieldName: "生活文化",    subjectId: "social", total: 16, correct: 9,  points: 20 }, // 56%
  { fieldId: "soc_chizu",  fieldName: "地図・地域",  subjectId: "social", total: 12, correct: 8,  points: 15 }, // 67%

  // ── 情報I (100点) ── 全体72%
  { fieldId: "info_joho",    fieldName: "情報社会",       subjectId: "info1", total: 15, correct: 13, points: 15 }, // 87%
  { fieldId: "info_comm",    fieldName: "情報デザイン",   subjectId: "info1", total: 14, correct: 11, points: 20 }, // 79%
  { fieldId: "info_comp",    fieldName: "プログラミング", subjectId: "info1", total: 22, correct: 14, points: 30 }, // 64%
  { fieldId: "info_network", fieldName: "ネットワーク",   subjectId: "info1", total: 12, correct: 7,  points: 15 }, // 58%
  { fieldId: "info_data",    fieldName: "データ活用",     subjectId: "info1", total: 16, correct: 12, points: 20 }, // 75%
];

/** 弱点TOP (正答率の低い順) */
export function getWeakPoints(stats: FieldStat[], topN = 5) {
  return [...stats]
    .filter((f) => f.total >= 10) // データが十分あるもの
    .map((f) => ({
      fieldId: f.fieldId,
      fieldName: f.fieldName,
      subjectId: f.subjectId,
      rate: f.correct / f.total,
      points: f.points,
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, topN);
}

/** 今日の復習件数 (デモ) */
export const SAMPLE_REVIEW_DUE_COUNT = 18;

/** 今日のタスク (デモ) */
export const SAMPLE_TODAY_TASKS = [
  { subject: "化学", task: "有機化学 弱点ドリル 10問", done: false, fieldId: "chem_yuuki" },
  { subject: "英語L", task: "第5問 リスニング演習", done: false, fieldId: "engl_q5" },
  { subject: "古文", task: "古文 復習 8問", done: false, fieldId: "kokugo_kobun" },
  { subject: "漢文", task: "漢文 基礎ドリル 10問", done: false, fieldId: "kokugo_kanbun" },
  { subject: "数学", task: "ベクトル 演習 10問", done: true, fieldId: "m2bc_vector" },
  { subject: "物理", task: "電磁気 復習 5問", done: true, fieldId: "phys_denki" },
];

/** 分野ごとのサンプル問題 */
export interface SampleQuestion {
  id: string;
  body: string;
  difficulty: number;
  choices: { id: string; label: string; body: string; isCorrect: boolean }[];
  explanation: string;
}

export const SAMPLE_QUESTIONS_BY_FIELD: Record<string, SampleQuestion[]> = {
  // 有機化学 (正答率48% — 最弱点)
  chem_yuuki: [
    {
      id: "cy1", body: "ベンゼンのニトロ化で得られる主生成物はどれか。",
      difficulty: 2,
      choices: [
        { id: "cy1a", label: "1", body: "ニトロベンゼン", isCorrect: true },
        { id: "cy1b", label: "2", body: "アニリン", isCorrect: false },
        { id: "cy1c", label: "3", body: "フェノール", isCorrect: false },
        { id: "cy1d", label: "4", body: "安息香酸", isCorrect: false },
      ],
      explanation: "ベンゼンに混酸（濃硝酸＋濃硫酸）を加えて加温すると、ニトロ化反応が起こりニトロベンゼン C₆H₅NO₂ が生成する。アニリンはニトロベンゼンを還元して得る。",
    },
    {
      id: "cy2", body: "エタノールを酸化すると得られる化合物として正しいものはどれか。酸化を穏やかに行った場合を答えよ。",
      difficulty: 1,
      choices: [
        { id: "cy2a", label: "1", body: "酢酸", isCorrect: false },
        { id: "cy2b", label: "2", body: "アセトアルデヒド", isCorrect: true },
        { id: "cy2c", label: "3", body: "ジエチルエーテル", isCorrect: false },
        { id: "cy2d", label: "4", body: "エチレン", isCorrect: false },
      ],
      explanation: "第一級アルコールであるエタノール CH₃CH₂OH を穏やかに酸化するとアセトアルデヒド CH₃CHO が得られる。さらに酸化すると酢酸 CH₃COOH になる。",
    },
    {
      id: "cy3", body: "次のうち、エステル結合を含む化合物はどれか。",
      difficulty: 2,
      choices: [
        { id: "cy3a", label: "1", body: "酢酸エチル", isCorrect: true },
        { id: "cy3b", label: "2", body: "ジエチルエーテル", isCorrect: false },
        { id: "cy3c", label: "3", body: "アセトアミド", isCorrect: false },
        { id: "cy3d", label: "4", body: "エタノール", isCorrect: false },
      ],
      explanation: "エステル結合は -COO- の構造。酢酸エチル CH₃COOC₂H₅ がエステル。ジエチルエーテルはエーテル結合 -O-、アセトアミドはアミド結合 -CONH₂。",
    },
  ],

  // 古文 (正答率54%)
  kokugo_kobun: [
    {
      id: "kb1", body: "「あはれなり」の意味として最も適切なものはどれか。",
      difficulty: 2,
      choices: [
        { id: "kb1a", label: "1", body: "しみじみと心に感じる", isCorrect: true },
        { id: "kb1b", label: "2", body: "かわいそうである", isCorrect: false },
        { id: "kb1c", label: "3", body: "はずかしい", isCorrect: false },
        { id: "kb1d", label: "4", body: "すばらしい", isCorrect: false },
      ],
      explanation: "「あはれ」は平安時代の美意識の中核をなす語。自然や人事にしみじみと感動する気持ちを表す。「かわいそう」は近世以降の意味変化。",
    },
    {
      id: "kb2", body: "「つれづれなり」の意味として最も適切なものはどれか。",
      difficulty: 2,
      choices: [
        { id: "kb2a", label: "1", body: "冷淡である", isCorrect: false },
        { id: "kb2b", label: "2", body: "することがなく退屈だ", isCorrect: true },
        { id: "kb2c", label: "3", body: "つらい", isCorrect: false },
        { id: "kb2d", label: "4", body: "連続している", isCorrect: false },
      ],
      explanation: "「つれづれなり」は「することもなく手持ちぶさたで退屈なさま」を表す。『徒然草』の冒頭「つれづれなるままに」が有名。",
    },
    {
      id: "kb3", body: "助動詞「む」の意味として適切でないものはどれか。",
      difficulty: 3,
      choices: [
        { id: "kb3a", label: "1", body: "推量", isCorrect: false },
        { id: "kb3b", label: "2", body: "意志", isCorrect: false },
        { id: "kb3c", label: "3", body: "過去", isCorrect: true },
        { id: "kb3d", label: "4", body: "仮定", isCorrect: false },
      ],
      explanation: "助動詞「む」は推量・意志・勧誘・仮定・婉曲の意味を持つ。過去の意味はない。過去は「き」「けり」で表す。",
    },
  ],

  // 漢文 (正答率50%)
  kokugo_kanbun: [
    {
      id: "kn1", body: "「不」の読み方として正しいものはどれか。「不可不知也」",
      difficulty: 2,
      choices: [
        { id: "kn1a", label: "1", body: "知らざるべからざるなり", isCorrect: true },
        { id: "kn1b", label: "2", body: "知るべからずなり", isCorrect: false },
        { id: "kn1c", label: "3", body: "不知なるべきなり", isCorrect: false },
        { id: "kn1d", label: "4", body: "知らずんばあらざるなり", isCorrect: false },
      ],
      explanation: "「不可不知也」は二重否定構文。「知ラザルベカラザルナリ」（知らないわけにはいかない＝必ず知るべきだ）と読む。",
    },
    {
      id: "kn2", body: "「矛盾」の故事で、商人が最初に自慢したのはどちらか。",
      difficulty: 1,
      choices: [
        { id: "kn2a", label: "1", body: "盾（たて）", isCorrect: true },
        { id: "kn2b", label: "2", body: "矛（ほこ）", isCorrect: false },
        { id: "kn2c", label: "3", body: "同時に自慢した", isCorrect: false },
        { id: "kn2d", label: "4", body: "本文中に順序の記述はない", isCorrect: false },
      ],
      explanation: "『韓非子』の原文では、楚の商人がまず盾を売りながら「吾が盾の堅きこと、能く陥すものなし」と自慢し、次に矛を「吾が矛の利きこと、物に於いて陥さざるなし」と自慢した。",
    },
  ],

  // ベクトル (正答率54%)
  m2bc_vector: [
    {
      id: "vc1", body: "ベクトル a⃗ = (3, 4) の大きさ |a⃗| を求めよ。",
      difficulty: 1,
      choices: [
        { id: "vc1a", label: "1", body: "5", isCorrect: true },
        { id: "vc1b", label: "2", body: "7", isCorrect: false },
        { id: "vc1c", label: "3", body: "√7", isCorrect: false },
        { id: "vc1d", label: "4", body: "12", isCorrect: false },
      ],
      explanation: "|a⃗| = √(3² + 4²) = √(9 + 16) = √25 = 5。三平方の定理(3,4,5)の直角三角形。",
    },
    {
      id: "vc2", body: "a⃗ = (1, 2), b⃗ = (3, -1) のとき、内積 a⃗ · b⃗ の値は？",
      difficulty: 2,
      choices: [
        { id: "vc2a", label: "1", body: "1", isCorrect: true },
        { id: "vc2b", label: "2", body: "5", isCorrect: false },
        { id: "vc2c", label: "3", body: "-1", isCorrect: false },
        { id: "vc2d", label: "4", body: "7", isCorrect: false },
      ],
      explanation: "a⃗ · b⃗ = 1×3 + 2×(-1) = 3 - 2 = 1。成分表示の内積は対応する成分の積の和。",
    },
    {
      id: "vc3", body: "2点 A(1,3), B(4,7) に対し、線分ABを 2:1 に内分する点Pの座標は？",
      difficulty: 3,
      choices: [
        { id: "vc3a", label: "1", body: "(3, 17/3)", isCorrect: true },
        { id: "vc3b", label: "2", body: "(2, 5)", isCorrect: false },
        { id: "vc3c", label: "3", body: "(5/2, 5)", isCorrect: false },
        { id: "vc3d", label: "4", body: "(3, 6)", isCorrect: false },
      ],
      explanation: "内分点の公式: P = ((1×1+2×4)/(2+1), (1×3+2×7)/(2+1)) = (9/3, 17/3) = (3, 17/3)",
    },
  ],

  // 電磁気 (正答率61%)
  phys_denki: [
    {
      id: "pd1", body: "電気量 2.0×10⁻⁶ C の点電荷から 0.30 m 離れた点の電場の強さは何 N/C か。クーロン定数 k = 9.0×10⁹ N·m²/C²",
      difficulty: 3,
      choices: [
        { id: "pd1a", label: "1", body: "2.0×10⁵ N/C", isCorrect: true },
        { id: "pd1b", label: "2", body: "6.0×10⁴ N/C", isCorrect: false },
        { id: "pd1c", label: "3", body: "2.0×10⁴ N/C", isCorrect: false },
        { id: "pd1d", label: "4", body: "1.8×10⁶ N/C", isCorrect: false },
      ],
      explanation: "E = kQ/r² = 9.0×10⁹ × 2.0×10⁻⁶ / (0.30)² = 18000/0.09 = 2.0×10⁵ N/C",
    },
    {
      id: "pd2", body: "抵抗値 R₁ = 3Ω と R₂ = 6Ω の抵抗を並列に接続したとき、合成抵抗は何 Ω か。",
      difficulty: 2,
      choices: [
        { id: "pd2a", label: "1", body: "2 Ω", isCorrect: true },
        { id: "pd2b", label: "2", body: "9 Ω", isCorrect: false },
        { id: "pd2c", label: "3", body: "4.5 Ω", isCorrect: false },
        { id: "pd2d", label: "4", body: "1 Ω", isCorrect: false },
      ],
      explanation: "並列合成抵抗: 1/R = 1/R₁ + 1/R₂ = 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2 → R = 2Ω",
    },
  ],

  // 確率 (正答率60%)
  m1a_jougo: [
    {
      id: "mj1", body: "赤玉3個、白玉5個の入った袋から同時に2個取り出すとき、2個とも赤玉である確率は？",
      difficulty: 2,
      choices: [
        { id: "mj1a", label: "1", body: "3/28", isCorrect: true },
        { id: "mj1b", label: "2", body: "9/64", isCorrect: false },
        { id: "mj1c", label: "3", body: "3/8", isCorrect: false },
        { id: "mj1d", label: "4", body: "1/7", isCorrect: false },
      ],
      explanation: "₃C₂/₈C₂ = 3/28。赤玉3個から2個選ぶ組合せは3通り、全8個から2個は28通り。",
    },
    {
      id: "mj2", body: "サイコロを2回振るとき、出た目の和が7になる確率は？",
      difficulty: 2,
      choices: [
        { id: "mj2a", label: "1", body: "1/6", isCorrect: true },
        { id: "mj2b", label: "2", body: "1/9", isCorrect: false },
        { id: "mj2c", label: "3", body: "5/36", isCorrect: false },
        { id: "mj2d", label: "4", body: "7/36", isCorrect: false },
      ],
      explanation: "和が7: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) の6通り。全事象36通り。P = 6/36 = 1/6。",
    },
  ],

  // 英語R 第6問 (正答率56%)
  engr_q6: [
    {
      id: "er1", body: "Which of the following best describes the author's main argument in the passage?\n\n(Passage summary: The article discusses how artificial intelligence is transforming healthcare, particularly in diagnostic imaging.)",
      difficulty: 3,
      choices: [
        { id: "er1a", label: "1", body: "AI will completely replace human doctors within a decade.", isCorrect: false },
        { id: "er1b", label: "2", body: "AI should be used as a tool to assist, not replace, medical professionals.", isCorrect: true },
        { id: "er1c", label: "3", body: "The healthcare industry has been slow to adopt new technologies.", isCorrect: false },
        { id: "er1d", label: "4", body: "Patients prefer AI-based diagnosis over human doctors.", isCorrect: false },
      ],
      explanation: "論説文の主旨把握問題。筆者はAIを「医療専門家を補助するツール」として捉えており、完全な代替を主張していない。選択肢2が最も適切。",
    },
  ],

  // 英語L 第5問 (正答率43% — 最弱)
  engl_q5: [
    {
      id: "el1", body: "[リスニング] 講義の内容に関する問題。講師が最も強調している点はどれか。\n\n(講義テーマ: 地球温暖化と海面上昇の関係)",
      difficulty: 3,
      choices: [
        { id: "el1a", label: "1", body: "海面上昇は今後100年間で止まる見込みである", isCorrect: false },
        { id: "el1b", label: "2", body: "氷河の融解速度は予想より遅い", isCorrect: false },
        { id: "el1c", label: "3", body: "沿岸部の都市は早急に対策を講じる必要がある", isCorrect: true },
        { id: "el1d", label: "4", body: "温暖化の主な原因は産業活動だけではない", isCorrect: false },
      ],
      explanation: "講義形式のリスニング問題。講師が繰り返し「coastal cities must act now」と述べている点から、選択肢3が正解。キーワードの繰り返しに注目する。",
    },
  ],

  // 人口・都市 (正答率53%)
  soc_jinkou: [
    {
      id: "sj1", body: "都市の内部構造に関するモデルのうち、同心円モデルを提唱した学者は誰か。",
      difficulty: 2,
      choices: [
        { id: "sj1a", label: "1", body: "バージェス", isCorrect: true },
        { id: "sj1b", label: "2", body: "ホイト", isCorrect: false },
        { id: "sj1c", label: "3", body: "ハリスとウルマン", isCorrect: false },
        { id: "sj1d", label: "4", body: "クリスタラー", isCorrect: false },
      ],
      explanation: "同心円モデルはバージェスが提唱。ホイトは扇形モデル、ハリス＝ウルマンは多核心モデル、クリスタラーは中心地理論を提唱した。",
    },
  ],

  // プログラミング (正答率64%)
  info_comp: [
    {
      id: "ic1", body: "次のプログラムの出力結果として正しいものはどれか。\n\nx = 0\nfor i in range(1, 5):\n    x = x + i\nprint(x)",
      difficulty: 2,
      choices: [
        { id: "ic1a", label: "1", body: "10", isCorrect: true },
        { id: "ic1b", label: "2", body: "15", isCorrect: false },
        { id: "ic1c", label: "3", body: "4", isCorrect: false },
        { id: "ic1d", label: "4", body: "5", isCorrect: false },
      ],
      explanation: "range(1, 5) は 1, 2, 3, 4 を生成。x = 0+1+2+3+4 = 10。range(1,5)は5を含まないことに注意。",
    },
  ],
};

/** 科目IDから日本語名を引く */
export const SUBJECT_NAMES: Record<string, string> = {
  kokugo: "国語", math1a: "数学IA", math2bc: "数学IIB/C",
  eng_read: "英語R", eng_listen: "英語L",
  physics: "物理", chemistry: "化学", social: "社会", info1: "情報I",
};
