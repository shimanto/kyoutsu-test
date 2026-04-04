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

  // ── 現代文 (正答率80%) ──
  kokugo_gendai: [
    {
      id: "kg1", body: "次の文章中の「それ」が指す内容として最も適切なものはどれか。\n\n「近代以降、人々は合理性を追求してきた。しかし、それは必ずしも幸福をもたらすものではなかった。」",
      difficulty: 2,
      choices: [
        { id: "kg1a", label: "1", body: "合理性の追求", isCorrect: true },
        { id: "kg1b", label: "2", body: "近代以降の時代", isCorrect: false },
        { id: "kg1c", label: "3", body: "人々の生活", isCorrect: false },
        { id: "kg1d", label: "4", body: "幸福の概念", isCorrect: false },
      ],
      explanation: "指示語「それ」は直前の文の主要な内容を指す。ここでは「合理性を追求してきた」こと全体を指す。指示語の指す範囲を正確に捉えることが現代文読解の基本。",
    },
    {
      id: "kg2", body: "評論文において「逆説」とはどのような表現技法か。",
      difficulty: 2,
      choices: [
        { id: "kg2a", label: "1", body: "一見矛盾しているように見えるが、深い真理を含む表現", isCorrect: true },
        { id: "kg2b", label: "2", body: "物事を反対の立場から述べる表現", isCorrect: false },
        { id: "kg2c", label: "3", body: "比喩を用いて抽象的な概念を説明する表現", isCorrect: false },
        { id: "kg2d", label: "4", body: "結論を先に述べてから理由を説明する表現", isCorrect: false },
      ],
      explanation: "逆説（パラドックス）は表面上矛盾しているように見えるが、よく考えると深い真理を含む表現。例:「急がば回れ」。評論文で頻出の修辞技法。",
    },
    {
      id: "kg3", body: "筆者の主張を読み取る際に最も重要な手がかりはどれか。",
      difficulty: 1,
      choices: [
        { id: "kg3a", label: "1", body: "文章の最初の一文", isCorrect: false },
        { id: "kg3b", label: "2", body: "具体例の内容", isCorrect: false },
        { id: "kg3c", label: "3", body: "「しかし」「だが」などの逆接の接続詞の後の文", isCorrect: true },
        { id: "kg3d", label: "4", body: "引用されている他者の意見", isCorrect: false },
      ],
      explanation: "逆接の接続詞（しかし・だが・ところが等）の後に筆者の本当に言いたいこと（主張）が来ることが多い。前半で一般論や反対意見を紹介し、逆接の後で自分の主張を述べるのが評論文の典型的な構造。",
    },
  ],

  // ── 数学IA: 数と式 (正答率90%) ──
  m1a_suushiki: [
    {
      id: "ms1", body: "√48 を最も簡単な形に変形せよ。",
      difficulty: 1,
      choices: [
        { id: "ms1a", label: "1", body: "4√3", isCorrect: true },
        { id: "ms1b", label: "2", body: "2√12", isCorrect: false },
        { id: "ms1c", label: "3", body: "6√2", isCorrect: false },
        { id: "ms1d", label: "4", body: "3√4", isCorrect: false },
      ],
      explanation: "√48 = √(16×3) = 4√3。根号の中を素因数分解し、平方数を外に出す。48 = 2⁴×3 なので √48 = 2²√3 = 4√3。",
    },
    {
      id: "ms2", body: "不等式 2x - 3 > 5x + 6 を解け。",
      difficulty: 2,
      choices: [
        { id: "ms2a", label: "1", body: "x < -3", isCorrect: true },
        { id: "ms2b", label: "2", body: "x > -3", isCorrect: false },
        { id: "ms2c", label: "3", body: "x < 3", isCorrect: false },
        { id: "ms2d", label: "4", body: "x > -1", isCorrect: false },
      ],
      explanation: "2x - 3 > 5x + 6 → 2x - 5x > 6 + 3 → -3x > 9 → x < -3（負の数で割ると不等号が逆転）。",
    },
    {
      id: "ms3", body: "x² + 6x + 9 を因数分解せよ。",
      difficulty: 1,
      choices: [
        { id: "ms3a", label: "1", body: "(x + 3)²", isCorrect: true },
        { id: "ms3b", label: "2", body: "(x + 3)(x - 3)", isCorrect: false },
        { id: "ms3c", label: "3", body: "(x + 9)(x + 1)", isCorrect: false },
        { id: "ms3d", label: "4", body: "(x + 6)(x + 3)", isCorrect: false },
      ],
      explanation: "x² + 6x + 9 = x² + 2·3·x + 3² = (x + 3)²。完全平方式 a² + 2ab + b² = (a + b)² のパターン。",
    },
  ],

  // ── 数学IA: 2次関数 (正答率86%) ──
  m1a_niji: [
    {
      id: "mn1", body: "y = x² - 4x + 3 の頂点の座標を求めよ。",
      difficulty: 2,
      choices: [
        { id: "mn1a", label: "1", body: "(2, -1)", isCorrect: true },
        { id: "mn1b", label: "2", body: "(-2, -1)", isCorrect: false },
        { id: "mn1c", label: "3", body: "(2, 3)", isCorrect: false },
        { id: "mn1d", label: "4", body: "(4, 3)", isCorrect: false },
      ],
      explanation: "y = x² - 4x + 3 = (x - 2)² - 4 + 3 = (x - 2)² - 1。平方完成により頂点は (2, -1)。",
    },
    {
      id: "mn2", body: "2次関数 y = -2x² + 8x - 5 の最大値を求めよ。",
      difficulty: 3,
      choices: [
        { id: "mn2a", label: "1", body: "3", isCorrect: true },
        { id: "mn2b", label: "2", body: "5", isCorrect: false },
        { id: "mn2c", label: "3", body: "-5", isCorrect: false },
        { id: "mn2d", label: "4", body: "8", isCorrect: false },
      ],
      explanation: "y = -2(x² - 4x) - 5 = -2(x - 2)² + 8 - 5 = -2(x - 2)² + 3。x² の係数が負なので上に凸。最大値は頂点の y 座標で 3。",
    },
    {
      id: "mn3", body: "2次方程式 x² - 5x + 6 = 0 の2つの解の和と積をそれぞれ求めよ。",
      difficulty: 1,
      choices: [
        { id: "mn3a", label: "1", body: "和: 5, 積: 6", isCorrect: true },
        { id: "mn3b", label: "2", body: "和: 6, 積: 5", isCorrect: false },
        { id: "mn3c", label: "3", body: "和: -5, 積: 6", isCorrect: false },
        { id: "mn3d", label: "4", body: "和: 5, 積: -6", isCorrect: false },
      ],
      explanation: "解と係数の関係: x² - (α+β)x + αβ = 0 より、和 α+β = 5、積 αβ = 6。実際に解くと x = 2, 3 で確認できる。",
    },
  ],

  // ── 数学IA: 図形と計量 (正答率76%) ──
  m1a_zukei: [
    {
      id: "mz1", body: "△ABC で a = 5, b = 7, C = 60° のとき、余弦定理を用いて c の値を求めよ。",
      difficulty: 3,
      choices: [
        { id: "mz1a", label: "1", body: "√39", isCorrect: true },
        { id: "mz1b", label: "2", body: "√74", isCorrect: false },
        { id: "mz1c", label: "3", body: "√49", isCorrect: false },
        { id: "mz1d", label: "4", body: "6", isCorrect: false },
      ],
      explanation: "余弦定理: c² = a² + b² - 2ab cos C = 25 + 49 - 2·5·7·cos60° = 74 - 70·(1/2) = 74 - 35 = 39。c = √39。",
    },
    {
      id: "mz2", body: "sin 150° の値を求めよ。",
      difficulty: 1,
      choices: [
        { id: "mz2a", label: "1", body: "1/2", isCorrect: true },
        { id: "mz2b", label: "2", body: "-1/2", isCorrect: false },
        { id: "mz2c", label: "3", body: "√3/2", isCorrect: false },
        { id: "mz2d", label: "4", body: "-√3/2", isCorrect: false },
      ],
      explanation: "sin 150° = sin(180° - 30°) = sin 30° = 1/2。第2象限では sin は正。",
    },
    {
      id: "mz3", body: "△ABC の面積を求めよ。a = 6, b = 8, C = 30°",
      difficulty: 2,
      choices: [
        { id: "mz3a", label: "1", body: "12", isCorrect: true },
        { id: "mz3b", label: "2", body: "24", isCorrect: false },
        { id: "mz3c", label: "3", body: "12√3", isCorrect: false },
        { id: "mz3d", label: "4", body: "6√3", isCorrect: false },
      ],
      explanation: "S = (1/2)ab sin C = (1/2)·6·8·sin30° = (1/2)·6·8·(1/2) = 12。",
    },
  ],

  // ── 数学IA: データ分析 (正答率80%) ──
  m1a_data: [
    {
      id: "md1", body: "データ {3, 5, 7, 9, 11} の分散を求めよ。",
      difficulty: 2,
      choices: [
        { id: "md1a", label: "1", body: "8", isCorrect: true },
        { id: "md1b", label: "2", body: "4", isCorrect: false },
        { id: "md1c", label: "3", body: "10", isCorrect: false },
        { id: "md1d", label: "4", body: "2√2", isCorrect: false },
      ],
      explanation: "平均 = (3+5+7+9+11)/5 = 7。分散 = {(3-7)²+(5-7)²+(7-7)²+(9-7)²+(11-7)²}/5 = (16+4+0+4+16)/5 = 40/5 = 8。",
    },
    {
      id: "md2", body: "箱ひげ図において、箱の左端と右端が表すものはどれか。",
      difficulty: 1,
      choices: [
        { id: "md2a", label: "1", body: "第1四分位数と第3四分位数", isCorrect: true },
        { id: "md2b", label: "2", body: "最小値と最大値", isCorrect: false },
        { id: "md2c", label: "3", body: "平均値と中央値", isCorrect: false },
        { id: "md2d", label: "4", body: "標準偏差の範囲", isCorrect: false },
      ],
      explanation: "箱ひげ図の箱は第1四分位数(Q1)から第3四分位数(Q3)の範囲。箱の中の線が中央値。ひげの端が最小値と最大値(外れ値除く)。",
    },
    {
      id: "md3", body: "相関係数 r の範囲として正しいものはどれか。",
      difficulty: 1,
      choices: [
        { id: "md3a", label: "1", body: "-1 ≦ r ≦ 1", isCorrect: true },
        { id: "md3b", label: "2", body: "0 ≦ r ≦ 1", isCorrect: false },
        { id: "md3c", label: "3", body: "-∞ < r < ∞", isCorrect: false },
        { id: "md3d", label: "4", body: "0 < r < 1", isCorrect: false },
      ],
      explanation: "相関係数は -1 以上 1 以下。r = 1 は完全な正の相関、r = -1 は完全な負の相関、r = 0 は相関なし。",
    },
  ],

  // ── 数学IA: 図形の性質 (正答率72%) ──
  m1a_seishitsu: [
    {
      id: "mt1", body: "三角形の内角の二等分線に関する定理で、△ABC の角 A の二等分線が BC と交わる点を D とするとき、成り立つ関係式はどれか。",
      difficulty: 2,
      choices: [
        { id: "mt1a", label: "1", body: "BD : DC = AB : AC", isCorrect: true },
        { id: "mt1b", label: "2", body: "BD : DC = AC : AB", isCorrect: false },
        { id: "mt1c", label: "3", body: "BD = DC", isCorrect: false },
        { id: "mt1d", label: "4", body: "BD : DC = AB² : AC²", isCorrect: false },
      ],
      explanation: "角の二等分線の定理: 内角の二等分線は対辺を他の2辺の比に分ける。BD : DC = AB : AC。",
    },
    {
      id: "mt2", body: "円に内接する四角形 ABCD において、∠A = 110° のとき、∠C は何度か。",
      difficulty: 2,
      choices: [
        { id: "mt2a", label: "1", body: "70°", isCorrect: true },
        { id: "mt2b", label: "2", body: "110°", isCorrect: false },
        { id: "mt2c", label: "3", body: "90°", isCorrect: false },
        { id: "mt2d", label: "4", body: "80°", isCorrect: false },
      ],
      explanation: "円に内接する四角形の対角の和は180°。∠A + ∠C = 180° → ∠C = 180° - 110° = 70°。",
    },
    {
      id: "mt3", body: "方べきの定理が適用できる図形の条件はどれか。",
      difficulty: 3,
      choices: [
        { id: "mt3a", label: "1", body: "円と直線（または2つの弦）が交わる場合", isCorrect: true },
        { id: "mt3b", label: "2", body: "2つの円が外接する場合", isCorrect: false },
        { id: "mt3c", label: "3", body: "三角形が円に外接する場合", isCorrect: false },
        { id: "mt3d", label: "4", body: "平行線と円が交わる場合", isCorrect: false },
      ],
      explanation: "方べきの定理は、円と2本の直線（弦・割線・接線）の交点に関する定理。PA·PB = PC·PD（2弦の場合）やPA·PB = PT²（接線の場合）。",
    },
  ],

  // ── 数学IIBC: 式と証明 (正答率82%) ──
  m2bc_shiki: [
    {
      id: "bs1", body: "二項定理を用いて (x + 2)⁴ の x² の係数を求めよ。",
      difficulty: 2,
      choices: [
        { id: "bs1a", label: "1", body: "24", isCorrect: true },
        { id: "bs1b", label: "2", body: "12", isCorrect: false },
        { id: "bs1c", label: "3", body: "16", isCorrect: false },
        { id: "bs1d", label: "4", body: "32", isCorrect: false },
      ],
      explanation: "二項定理: ₄C₂ · x² · 2² = 6 · x² · 4 = 24x²。x² の係数は 24。",
    },
    {
      id: "bs2", body: "a > 0, b > 0 のとき、相加相乗平均の不等式として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "bs2a", label: "1", body: "(a + b)/2 ≧ √(ab)", isCorrect: true },
        { id: "bs2b", label: "2", body: "(a + b)/2 ≦ √(ab)", isCorrect: false },
        { id: "bs2c", label: "3", body: "a + b ≧ 2ab", isCorrect: false },
        { id: "bs2d", label: "4", body: "√a + √b ≧ √(a+b)", isCorrect: false },
      ],
      explanation: "相加平均 ≧ 相乗平均: (a+b)/2 ≧ √(ab)。等号成立は a = b のとき。最大・最小問題の重要公式。",
    },
    {
      id: "bs3", body: "整式 P(x) = 2x³ - 3x² + x - 5 を x - 1 で割った余りを求めよ。",
      difficulty: 2,
      choices: [
        { id: "bs3a", label: "1", body: "-5", isCorrect: true },
        { id: "bs3b", label: "2", body: "5", isCorrect: false },
        { id: "bs3c", label: "3", body: "-3", isCorrect: false },
        { id: "bs3d", label: "4", body: "1", isCorrect: false },
      ],
      explanation: "剰余の定理: P(x) を (x - a) で割った余りは P(a)。P(1) = 2 - 3 + 1 - 5 = -5。",
    },
  ],

  // ── 数学IIBC: 三角・指数対数 (正答率71%) ──
  m2bc_kansuu: [
    {
      id: "bk1", body: "log₂ 32 の値を求めよ。",
      difficulty: 1,
      choices: [
        { id: "bk1a", label: "1", body: "5", isCorrect: true },
        { id: "bk1b", label: "2", body: "4", isCorrect: false },
        { id: "bk1c", label: "3", body: "6", isCorrect: false },
        { id: "bk1d", label: "4", body: "16", isCorrect: false },
      ],
      explanation: "2⁵ = 32 なので log₂ 32 = 5。対数の定義: logₐ b = c は aᶜ = b を意味する。",
    },
    {
      id: "bk2", body: "sin²θ + cos²θ = 1 を利用して、sinθ = 3/5 (0 < θ < π/2) のとき cosθ の値を求めよ。",
      difficulty: 2,
      choices: [
        { id: "bk2a", label: "1", body: "4/5", isCorrect: true },
        { id: "bk2b", label: "2", body: "3/5", isCorrect: false },
        { id: "bk2c", label: "3", body: "-4/5", isCorrect: false },
        { id: "bk2d", label: "4", body: "√(16/25)", isCorrect: false },
      ],
      explanation: "cos²θ = 1 - sin²θ = 1 - 9/25 = 16/25。0 < θ < π/2 で cosθ > 0 なので cosθ = 4/5。選択肢4は同じ値だが最も簡単な形ではない。",
    },
    {
      id: "bk3", body: "3^x = 27 のとき、x の値は？",
      difficulty: 1,
      choices: [
        { id: "bk3a", label: "1", body: "3", isCorrect: true },
        { id: "bk3b", label: "2", body: "9", isCorrect: false },
        { id: "bk3c", label: "3", body: "27", isCorrect: false },
        { id: "bk3d", label: "4", body: "1/3", isCorrect: false },
      ],
      explanation: "27 = 3³ なので 3^x = 3³ より x = 3。指数の底が同じなら指数同士を比較する。",
    },
  ],

  // ── 数学IIBC: 微分・積分 (正答率73%) ──
  m2bc_bibun: [
    {
      id: "bb1", body: "f(x) = x³ - 3x² + 2 の導関数 f'(x) を求めよ。",
      difficulty: 1,
      choices: [
        { id: "bb1a", label: "1", body: "3x² - 6x", isCorrect: true },
        { id: "bb1b", label: "2", body: "3x² - 3x", isCorrect: false },
        { id: "bb1c", label: "3", body: "x² - 6x + 2", isCorrect: false },
        { id: "bb1d", label: "4", body: "3x² - 6x + 2", isCorrect: false },
      ],
      explanation: "(xⁿ)' = nxⁿ⁻¹ を各項に適用。(x³)' = 3x², (-3x²)' = -6x, (2)' = 0。よって f'(x) = 3x² - 6x。",
    },
    {
      id: "bb2", body: "∫₀² (2x + 1) dx の値を求めよ。",
      difficulty: 2,
      choices: [
        { id: "bb2a", label: "1", body: "6", isCorrect: true },
        { id: "bb2b", label: "2", body: "5", isCorrect: false },
        { id: "bb2c", label: "3", body: "8", isCorrect: false },
        { id: "bb2d", label: "4", body: "4", isCorrect: false },
      ],
      explanation: "∫₀²(2x+1)dx = [x² + x]₀² = (4 + 2) - (0 + 0) = 6。",
    },
    {
      id: "bb3", body: "f(x) = x³ - 3x の極値をすべて求めよ。",
      difficulty: 3,
      choices: [
        { id: "bb3a", label: "1", body: "極大値 2, 極小値 -2", isCorrect: true },
        { id: "bb3b", label: "2", body: "極大値 3, 極小値 -3", isCorrect: false },
        { id: "bb3c", label: "3", body: "極大値 2, 極小値 0", isCorrect: false },
        { id: "bb3d", label: "4", body: "極値なし", isCorrect: false },
      ],
      explanation: "f'(x) = 3x² - 3 = 3(x+1)(x-1)。x=-1 で極大 f(-1) = -1+3 = 2、x=1 で極小 f(1) = 1-3 = -2。",
    },
  ],

  // ── 数学IIBC: 数列 (正答率76%) ──
  m2bc_suuretsu: [
    {
      id: "bsr1", body: "等差数列 {aₙ} で a₁ = 3, d = 4 のとき、a₁₀ の値は？",
      difficulty: 1,
      choices: [
        { id: "bsr1a", label: "1", body: "39", isCorrect: true },
        { id: "bsr1b", label: "2", body: "43", isCorrect: false },
        { id: "bsr1c", label: "3", body: "40", isCorrect: false },
        { id: "bsr1d", label: "4", body: "36", isCorrect: false },
      ],
      explanation: "等差数列の一般項: aₙ = a₁ + (n-1)d = 3 + 9×4 = 39。",
    },
    {
      id: "bsr2", body: "Σ(k=1 to n) k = n(n+1)/2 を用いて、Σ(k=1 to 20) k の値を求めよ。",
      difficulty: 1,
      choices: [
        { id: "bsr2a", label: "1", body: "210", isCorrect: true },
        { id: "bsr2b", label: "2", body: "200", isCorrect: false },
        { id: "bsr2c", label: "3", body: "190", isCorrect: false },
        { id: "bsr2d", label: "4", body: "220", isCorrect: false },
      ],
      explanation: "n = 20 を代入: 20×21/2 = 420/2 = 210。",
    },
    {
      id: "bsr3", body: "初項 2, 公比 3 の等比数列の第5項は？",
      difficulty: 2,
      choices: [
        { id: "bsr3a", label: "1", body: "162", isCorrect: true },
        { id: "bsr3b", label: "2", body: "486", isCorrect: false },
        { id: "bsr3c", label: "3", body: "54", isCorrect: false },
        { id: "bsr3d", label: "4", body: "243", isCorrect: false },
      ],
      explanation: "等比数列の一般項: aₙ = a₁ · rⁿ⁻¹ = 2 · 3⁴ = 2 · 81 = 162。",
    },
  ],

  // ── 数学IIBC: 統計的推測 (正答率73%) ──
  m2bc_toukei: [
    {
      id: "bt1", body: "正規分布 N(50, 10²) に従う確率変数 X について、P(40 ≦ X ≦ 60) はおよそいくらか。(標準正規分布表より P(|Z| ≦ 1) ≈ 0.6827)",
      difficulty: 3,
      choices: [
        { id: "bt1a", label: "1", body: "約 68%", isCorrect: true },
        { id: "bt1b", label: "2", body: "約 95%", isCorrect: false },
        { id: "bt1c", label: "3", body: "約 50%", isCorrect: false },
        { id: "bt1d", label: "4", body: "約 99%", isCorrect: false },
      ],
      explanation: "Z = (X - 50)/10 と標準化。40 ≦ X ≦ 60 → -1 ≦ Z ≦ 1。P(|Z| ≦ 1) ≈ 0.6827 ≈ 68%。",
    },
    {
      id: "bt2", body: "母平均の 95% 信頼区間を求める際に使う z の値は？",
      difficulty: 2,
      choices: [
        { id: "bt2a", label: "1", body: "1.96", isCorrect: true },
        { id: "bt2b", label: "2", body: "1.64", isCorrect: false },
        { id: "bt2c", label: "3", body: "2.58", isCorrect: false },
        { id: "bt2d", label: "4", body: "1.28", isCorrect: false },
      ],
      explanation: "95% 信頼区間は z = 1.96。90% は 1.64、99% は 2.58。共通テストでは 1.96 が最頻出。",
    },
    {
      id: "bt3", body: "仮説検定で「帰無仮説を棄却する」とはどういう意味か。",
      difficulty: 2,
      choices: [
        { id: "bt3a", label: "1", body: "観測データが帰無仮説のもとでは極めて起こりにくいと判断すること", isCorrect: true },
        { id: "bt3b", label: "2", body: "帰無仮説が間違っていると証明されたこと", isCorrect: false },
        { id: "bt3c", label: "3", body: "対立仮説が正しいと確定したこと", isCorrect: false },
        { id: "bt3d", label: "4", body: "データの収集方法に問題があったこと", isCorrect: false },
      ],
      explanation: "帰無仮説の棄却は「帰無仮説が正しいと仮定した場合、このデータが得られる確率が有意水準より小さい」ことを意味する。帰無仮説が間違いだと『証明』したわけではない点に注意。",
    },
  ],

  // ── 英語R: 第1問 短文 (正答率90%) ──
  engr_q1: [
    {
      id: "er1q1", body: "Choose the best word to fill in the blank.\n\nThe new library will be ( ) to all students starting next Monday.",
      difficulty: 1,
      choices: [
        { id: "er1q1a", label: "1", body: "accessible", isCorrect: true },
        { id: "er1q1b", label: "2", body: "acceptable", isCorrect: false },
        { id: "er1q1c", label: "3", body: "accountable", isCorrect: false },
        { id: "er1q1d", label: "4", body: "adjustable", isCorrect: false },
      ],
      explanation: "accessible = 利用できる。「図書館が来週月曜から全生徒に利用可能になる」が自然。acceptable は許容できる、accountable は責任がある、adjustable は調節できる。",
    },
    {
      id: "er1q2", body: "Which is closest in meaning to the underlined word?\n\nThe teacher emphasized the importance of regular practice.",
      difficulty: 1,
      choices: [
        { id: "er1q2a", label: "1", body: "stressed", isCorrect: true },
        { id: "er1q2b", label: "2", body: "ignored", isCorrect: false },
        { id: "er1q2c", label: "3", body: "questioned", isCorrect: false },
        { id: "er1q2d", label: "4", body: "denied", isCorrect: false },
      ],
      explanation: "emphasized = 強調した。stress (stressed) が同義。ignore = 無視する、question = 疑問視する、deny = 否定する。",
    },
    {
      id: "er1q3", body: "Choose the sentence that best describes the situation.\n\nA sign at the park entrance says: \"No pets allowed except guide dogs.\"",
      difficulty: 2,
      choices: [
        { id: "er1q3a", label: "1", body: "Guide dogs can enter the park, but other pets cannot.", isCorrect: true },
        { id: "er1q3b", label: "2", body: "All dogs are welcome in the park.", isCorrect: false },
        { id: "er1q3c", label: "3", body: "No animals are allowed in the park.", isCorrect: false },
        { id: "er1q3d", label: "4", body: "Only guide dogs are available at the park.", isCorrect: false },
      ],
      explanation: "except = ～を除いて。「盲導犬を除きペット禁止」= 盲導犬は入園可、他のペットは不可。共通テスト頻出の except の正確な理解を問う問題。",
    },
  ],

  // ── 英語R: 第2問 情報検索 (正答率85%) ──
  engr_q2: [
    {
      id: "er2q1", body: "According to the following notice, when does the summer program start?\n\n\"Summer Reading Program 2027\nDates: July 20 - August 15\nRegistration: Opens June 1\nAge: 12-18 years old\nFee: Free\"",
      difficulty: 1,
      choices: [
        { id: "er2q1a", label: "1", body: "July 20", isCorrect: true },
        { id: "er2q1b", label: "2", body: "June 1", isCorrect: false },
        { id: "er2q1c", label: "3", body: "August 15", isCorrect: false },
        { id: "er2q1d", label: "4", body: "July 1", isCorrect: false },
      ],
      explanation: "プログラム開始日は Dates: July 20。June 1 は登録開始日、August 15 は終了日。情報の正確な読み取りが問われる。",
    },
    {
      id: "er2q2", body: "A 10-year-old child wants to join the program. What would the organizer most likely say?",
      difficulty: 2,
      choices: [
        { id: "er2q2a", label: "1", body: "Sorry, you need to be at least 12 years old.", isCorrect: true },
        { id: "er2q2b", label: "2", body: "Welcome! Please register by June 1.", isCorrect: false },
        { id: "er2q2c", label: "3", body: "You need to pay a registration fee.", isCorrect: false },
        { id: "er2q2d", label: "4", body: "The program is already full.", isCorrect: false },
      ],
      explanation: "Age: 12-18 years old なので10歳は対象外。条件の読み取りと推論の問題。",
    },
    {
      id: "er2q3", body: "Which of the following is true about the program?",
      difficulty: 1,
      choices: [
        { id: "er2q3a", label: "1", body: "Participants do not need to pay.", isCorrect: true },
        { id: "er2q3b", label: "2", body: "It lasts for two months.", isCorrect: false },
        { id: "er2q3c", label: "3", body: "Adults can also participate.", isCorrect: false },
        { id: "er2q3d", label: "4", body: "Registration closes on July 20.", isCorrect: false },
      ],
      explanation: "Fee: Free なので参加費無料。7/20-8/15 は約4週間（2ヶ月ではない）。18歳以下が対象。",
    },
  ],

  // ── 英語R: 第3問 要旨把握 (正答率78%) ──
  engr_q3: [
    {
      id: "er3q1", body: "What is the main topic of the following passage?\n\n\"Many cities around the world are now creating car-free zones in their downtown areas. These zones encourage walking and cycling, reduce air pollution, and make streets safer for pedestrians. Studies show that businesses in car-free zones often see increased sales.\"",
      difficulty: 2,
      choices: [
        { id: "er3q1a", label: "1", body: "The benefits of car-free zones in cities", isCorrect: true },
        { id: "er3q1b", label: "2", body: "How to reduce traffic accidents", isCorrect: false },
        { id: "er3q1c", label: "3", body: "The decline of car sales worldwide", isCorrect: false },
        { id: "er3q1d", label: "4", body: "Why people prefer cycling to driving", isCorrect: false },
      ],
      explanation: "パッセージ全体が car-free zones の利点（歩行・自転車推進、大気汚染削減、安全性向上、売上増加）を述べている。要旨を正確に捉えることが重要。",
    },
    {
      id: "er3q2", body: "According to the passage, what happens to businesses in car-free zones?",
      difficulty: 1,
      choices: [
        { id: "er3q2a", label: "1", body: "They often experience higher sales.", isCorrect: true },
        { id: "er3q2b", label: "2", body: "They lose customers due to lack of parking.", isCorrect: false },
        { id: "er3q2c", label: "3", body: "They are forced to close down.", isCorrect: false },
        { id: "er3q2d", label: "4", body: "They move to suburban areas.", isCorrect: false },
      ],
      explanation: "本文最終文: businesses in car-free zones often see increased sales。直接的な情報読み取りの問題。",
    },
    {
      id: "er3q3", body: "Which is NOT mentioned as a benefit of car-free zones?",
      difficulty: 2,
      choices: [
        { id: "er3q3a", label: "1", body: "Lower housing costs", isCorrect: true },
        { id: "er3q3b", label: "2", body: "Less air pollution", isCorrect: false },
        { id: "er3q3c", label: "3", body: "Safer streets for pedestrians", isCorrect: false },
        { id: "er3q3d", label: "4", body: "More walking and cycling", isCorrect: false },
      ],
      explanation: "本文で述べられている利点: walking/cycling推進, air pollution削減, safer streets, increased sales。住居費の低下は言及なし。NOT問題は消去法が有効。",
    },
  ],

  // ── 英語R: 第4問 図表 (正答率65%) ──
  engr_q4: [
    {
      id: "er4q1", body: "Look at the following data.\n\nAverage sleep hours by age group:\n- Teens (13-17): 7.2 hours\n- Adults (18-64): 6.8 hours\n- Seniors (65+): 7.5 hours\n\nWhich age group gets the most sleep on average?",
      difficulty: 1,
      choices: [
        { id: "er4q1a", label: "1", body: "Seniors (65+)", isCorrect: true },
        { id: "er4q1b", label: "2", body: "Teens (13-17)", isCorrect: false },
        { id: "er4q1c", label: "3", body: "Adults (18-64)", isCorrect: false },
        { id: "er4q1d", label: "4", body: "All groups sleep the same amount.", isCorrect: false },
      ],
      explanation: "数値の比較: Seniors 7.5 > Teens 7.2 > Adults 6.8。図表問題は数値の正確な読み取りが基本。",
    },
    {
      id: "er4q2", body: "How much more sleep do teens get compared to adults?",
      difficulty: 2,
      choices: [
        { id: "er4q2a", label: "1", body: "0.4 hours", isCorrect: true },
        { id: "er4q2b", label: "2", body: "0.3 hours", isCorrect: false },
        { id: "er4q2c", label: "3", body: "0.7 hours", isCorrect: false },
        { id: "er4q2d", label: "4", body: "1.0 hour", isCorrect: false },
      ],
      explanation: "7.2 - 6.8 = 0.4 hours。計算問題。共通テストでは単純な差を求める問題が多い。",
    },
    {
      id: "er4q3", body: "Based on the data, which statement is correct?",
      difficulty: 2,
      choices: [
        { id: "er4q3a", label: "1", body: "Working-age adults sleep the least.", isCorrect: true },
        { id: "er4q3b", label: "2", body: "Teenagers need less sleep than seniors.", isCorrect: false },
        { id: "er4q3c", label: "3", body: "Sleep hours increase with age.", isCorrect: false },
        { id: "er4q3d", label: "4", body: "All groups get at least 7.5 hours.", isCorrect: false },
      ],
      explanation: "Adults 6.8h が最少。「年齢とともに増加」ではない(V字型)。全グループ7.5h以上ではない。データから正しい推論を選ぶ問題。",
    },
  ],

  // ── 英語R: 第5問 物語文 (正答率60%) ──
  engr_q5: [
    {
      id: "er5q1", body: "Read the following passage and answer the question.\n\n\"Sarah had always dreamed of studying abroad. When she finally received the acceptance letter from a university in London, she felt a mix of excitement and fear. Her parents supported her decision, but her grandmother cried quietly in the kitchen.\"\n\nHow did Sarah feel when she got the letter?",
      difficulty: 2,
      choices: [
        { id: "er5q1a", label: "1", body: "Both happy and anxious", isCorrect: true },
        { id: "er5q1b", label: "2", body: "Only excited", isCorrect: false },
        { id: "er5q1c", label: "3", body: "Disappointed", isCorrect: false },
        { id: "er5q1d", label: "4", body: "Angry at her parents", isCorrect: false },
      ],
      explanation: "a mix of excitement and fear = 興奮と恐怖が混在 = happy and anxious。物語文では登場人物の感情を正確に読み取ることが重要。",
    },
    {
      id: "er5q2", body: "Why did the grandmother cry?",
      difficulty: 3,
      choices: [
        { id: "er5q2a", label: "1", body: "She was sad about Sarah going far away.", isCorrect: true },
        { id: "er5q2b", label: "2", body: "She was angry at Sarah's decision.", isCorrect: false },
        { id: "er5q2c", label: "3", body: "She was happy for Sarah's success.", isCorrect: false },
        { id: "er5q2d", label: "4", body: "She was worried about the cost.", isCorrect: false },
      ],
      explanation: "祖母が台所で静かに泣いた文脈から、孫が遠くに行くことへの寂しさが読み取れる。「quietly」が怒りではなく悲しみを示す。行間を読む推論問題。",
    },
    {
      id: "er5q3", body: "What can be inferred about Sarah's family?",
      difficulty: 2,
      choices: [
        { id: "er5q3a", label: "1", body: "They care about Sarah but have different reactions.", isCorrect: true },
        { id: "er5q3b", label: "2", body: "They all oppose Sarah's decision.", isCorrect: false },
        { id: "er5q3c", label: "3", body: "They have no interest in Sarah's future.", isCorrect: false },
        { id: "er5q3d", label: "4", body: "They want Sarah to stay in London permanently.", isCorrect: false },
      ],
      explanation: "両親はsupported、祖母はcried quietly。家族全員がSarahを大切に思っているが反応は異なる。推論問題は本文の情報を統合して判断する。",
    },
  ],

  // ── 英語L: 第1問 短い対話 (正答率90%) ──
  engl_q1: [
    {
      id: "el1q1", body: "[リスニング] 短い対話を聞いて答えよ。\n\nMan: \"Excuse me, could you tell me where the nearest station is?\"\nWoman: \"Sure. Go straight and turn left at the second traffic light.\"\n\n質問: What does the woman tell the man to do?",
      difficulty: 1,
      choices: [
        { id: "el1q1a", label: "1", body: "Go straight and turn left at the second light.", isCorrect: true },
        { id: "el1q1b", label: "2", body: "Turn right at the first traffic light.", isCorrect: false },
        { id: "el1q1c", label: "3", body: "Take a bus to the station.", isCorrect: false },
        { id: "el1q1d", label: "4", body: "Go back the way he came.", isCorrect: false },
      ],
      explanation: "道案内の定型表現。go straight(まっすぐ)、turn left(左折)、at the second traffic light(2つ目の信号)の聞き取り。",
    },
    {
      id: "el1q2", body: "[リスニング]\n\nWoman: \"Would you like coffee or tea?\"\nMan: \"I'd prefer tea, please.\"\n\n質問: What does the man want?",
      difficulty: 1,
      choices: [
        { id: "el1q2a", label: "1", body: "Tea", isCorrect: true },
        { id: "el1q2b", label: "2", body: "Coffee", isCorrect: false },
        { id: "el1q2c", label: "3", body: "Both coffee and tea", isCorrect: false },
        { id: "el1q2d", label: "4", body: "Neither", isCorrect: false },
      ],
      explanation: "I'd prefer tea = 紅茶の方がいい。prefer は「～の方を好む」。シンプルな聞き取り問題。",
    },
    {
      id: "el1q3", body: "[リスニング]\n\nMan: \"What time does the movie start?\"\nWoman: \"It starts at 7:30, but we should get there by 7.\"\n\n質問: What time does the woman suggest arriving?",
      difficulty: 1,
      choices: [
        { id: "el1q3a", label: "1", body: "7:00", isCorrect: true },
        { id: "el1q3b", label: "2", body: "7:30", isCorrect: false },
        { id: "el1q3c", label: "3", body: "6:30", isCorrect: false },
        { id: "el1q3d", label: "4", body: "8:00", isCorrect: false },
      ],
      explanation: "we should get there by 7 = 7時までに着くべき。映画開始(7:30)と到着推奨時間(7:00)を区別する。数字の聞き分けが重要。",
    },
  ],

  // ── 英語L: 第2問 対話応答 (正答率78%) ──
  engl_q2: [
    {
      id: "el2q1", body: "[リスニング]\n\nWoman: \"I can't believe it's raining again. I forgot my umbrella.\"\nMan: \"Don't worry. I have an extra one you can use.\"\n\n質問: What will the man probably do?",
      difficulty: 2,
      choices: [
        { id: "el2q1a", label: "1", body: "Lend his umbrella to the woman.", isCorrect: true },
        { id: "el2q1b", label: "2", body: "Buy a new umbrella for the woman.", isCorrect: false },
        { id: "el2q1c", label: "3", body: "Drive the woman home.", isCorrect: false },
        { id: "el2q1d", label: "4", body: "Wait until the rain stops.", isCorrect: false },
      ],
      explanation: "I have an extra one you can use = 余分の傘を使っていいよ。文脈から次の行動を推測する問題。",
    },
    {
      id: "el2q2", body: "[リスニング]\n\nMan: \"How was the concert last night?\"\nWoman: \"It was amazing! The singer performed for over two hours.\"\n\n質問: How does the woman feel about the concert?",
      difficulty: 1,
      choices: [
        { id: "el2q2a", label: "1", body: "She enjoyed it very much.", isCorrect: true },
        { id: "el2q2b", label: "2", body: "She thought it was too long.", isCorrect: false },
        { id: "el2q2c", label: "3", body: "She was disappointed.", isCorrect: false },
        { id: "el2q2d", label: "4", body: "She left before it ended.", isCorrect: false },
      ],
      explanation: "amazing = すばらしい。感情を表す形容詞の聞き取り。tone(声のトーン)からも判断できる。",
    },
    {
      id: "el2q3", body: "[リスニング]\n\nWoman: \"Could you pick up some milk on your way home?\"\nMan: \"Sure, anything else?\"\nWoman: \"Maybe some bread, too.\"\n\n質問: What will the man buy?",
      difficulty: 1,
      choices: [
        { id: "el2q3a", label: "1", body: "Milk and bread", isCorrect: true },
        { id: "el2q3b", label: "2", body: "Only milk", isCorrect: false },
        { id: "el2q3c", label: "3", body: "Milk, bread, and eggs", isCorrect: false },
        { id: "el2q3d", label: "4", body: "Nothing, because the store is closed", isCorrect: false },
      ],
      explanation: "milk + bread の2つ。追加の依頼(Maybe some bread, too)を聞き逃さないこと。リストの正確な把握。",
    },
  ],

  // ── 英語L: 第3問 対話概要 (正答率69%) ──
  engl_q3: [
    {
      id: "el3q1", body: "[リスニング] やや長めの対話を聞いて答えよ。\n\n(場面: 大学の学生相談室で、学生が留学について相談している)\n\n質問: What is the student's main concern about studying abroad?",
      difficulty: 2,
      choices: [
        { id: "el3q1a", label: "1", body: "The cost of living in another country", isCorrect: true },
        { id: "el3q1b", label: "2", body: "Learning a new language from scratch", isCorrect: false },
        { id: "el3q1c", label: "3", body: "Making friends in a foreign country", isCorrect: false },
        { id: "el3q1d", label: "4", body: "Choosing which country to go to", isCorrect: false },
      ],
      explanation: "対話の概要を把握する問題。学生が繰り返し費用について質問していることから、主な懸念は生活費。繰り返される話題がmain concernの手がかり。",
    },
    {
      id: "el3q2", body: "[リスニング]\n\n質問: What does the advisor suggest?",
      difficulty: 2,
      choices: [
        { id: "el3q2a", label: "1", body: "Applying for a scholarship", isCorrect: true },
        { id: "el3q2b", label: "2", body: "Giving up the idea of studying abroad", isCorrect: false },
        { id: "el3q2c", label: "3", body: "Working part-time during the semester", isCorrect: false },
        { id: "el3q2d", label: "4", body: "Borrowing money from family", isCorrect: false },
      ],
      explanation: "アドバイザーが奨学金制度を紹介している場面。suggest の後に続く提案内容を正確に捉える。",
    },
    {
      id: "el3q3", body: "[リスニング]\n\n質問: What will the student probably do next?",
      difficulty: 3,
      choices: [
        { id: "el3q3a", label: "1", body: "Look into scholarship options", isCorrect: true },
        { id: "el3q3b", label: "2", body: "Cancel the study abroad plan", isCorrect: false },
        { id: "el3q3c", label: "3", body: "Talk to their parents first", isCorrect: false },
        { id: "el3q3d", label: "4", body: "Choose a cheaper university", isCorrect: false },
      ],
      explanation: "アドバイザーの提案を受け入れる態度から、次のステップとして奨学金を調べることが推測できる。対話の流れから次の行動を予測する問題。",
    },
  ],

  // ── 英語L: 第4問 モノローグ (正答率56%) ──
  engl_q4: [
    {
      id: "el4q1", body: "[リスニング] アナウンスを聞いて答えよ。\n\n(場面: 空港のアナウンス)\n\"Attention passengers on Flight 302 to Osaka. Due to weather conditions, the departure has been delayed by approximately 90 minutes. The new departure time is 3:30 PM.\"\n\n質問: What was the original departure time?",
      difficulty: 2,
      choices: [
        { id: "el4q1a", label: "1", body: "2:00 PM", isCorrect: true },
        { id: "el4q1b", label: "2", body: "3:30 PM", isCorrect: false },
        { id: "el4q1c", label: "3", body: "1:30 PM", isCorrect: false },
        { id: "el4q1d", label: "4", body: "4:00 PM", isCorrect: false },
      ],
      explanation: "新出発時刻3:30PM - 遅延90分 = 元の出発時刻2:00PM。計算が必要なリスニング問題。情報を聞き取った後に推論する力が問われる。",
    },
    {
      id: "el4q2", body: "[リスニング]\n\n質問: Why is the flight delayed?",
      difficulty: 1,
      choices: [
        { id: "el4q2a", label: "1", body: "Because of bad weather", isCorrect: true },
        { id: "el4q2b", label: "2", body: "Because of a mechanical problem", isCorrect: false },
        { id: "el4q2c", label: "3", body: "Because the pilot is late", isCorrect: false },
        { id: "el4q2d", label: "4", body: "Because of too many passengers", isCorrect: false },
      ],
      explanation: "Due to weather conditions = 天候の影響で。理由を尋ねる問題では due to / because of の後に注目。",
    },
    {
      id: "el4q3", body: "[リスニング]\n\n質問: How long is the delay?",
      difficulty: 1,
      choices: [
        { id: "el4q3a", label: "1", body: "About one and a half hours", isCorrect: true },
        { id: "el4q3b", label: "2", body: "About two hours", isCorrect: false },
        { id: "el4q3c", label: "3", body: "About one hour", isCorrect: false },
        { id: "el4q3d", label: "4", body: "About 30 minutes", isCorrect: false },
      ],
      explanation: "approximately 90 minutes = 約90分 = 約1時間半。数値の聞き取りと単位変換。",
    },
  ],

  // ── 英語L: 第6問 長い対話 (正答率50%) ──
  engl_q6: [
    {
      id: "el6q1", body: "[リスニング] 2人の学生の長い議論を聞いて答えよ。\n\n(テーマ: SNSが若者のメンタルヘルスに与える影響)\n\n質問: What is Speaker A's main argument?",
      difficulty: 3,
      choices: [
        { id: "el6q1a", label: "1", body: "Social media can negatively affect mental health through comparison.", isCorrect: true },
        { id: "el6q1b", label: "2", body: "Social media should be completely banned for teenagers.", isCorrect: false },
        { id: "el6q1c", label: "3", body: "Social media has no effect on mental health.", isCorrect: false },
        { id: "el6q1d", label: "4", body: "Only adults should be allowed to use social media.", isCorrect: false },
      ],
      explanation: "Speaker Aの主張は「SNSでの他者比較が精神的健康に悪影響」。完全禁止(選択肢2)のような極端な主張ではない。長い対話では各話者の立場を整理することが重要。",
    },
    {
      id: "el6q2", body: "[リスニング]\n\n質問: On what point do both speakers agree?",
      difficulty: 3,
      choices: [
        { id: "el6q2a", label: "1", body: "Education about healthy social media use is important.", isCorrect: true },
        { id: "el6q2b", label: "2", body: "Social media should be banned in schools.", isCorrect: false },
        { id: "el6q2c", label: "3", body: "Parents should monitor all online activity.", isCorrect: false },
        { id: "el6q2d", label: "4", body: "Social media is mostly harmful.", isCorrect: false },
      ],
      explanation: "議論の対立点と一致点を区別する問題。両者とも「リテラシー教育の重要性」には同意。長い対話では共通点を見つけるのが難しい。",
    },
    {
      id: "el6q3", body: "[リスニング]\n\n質問: What does Speaker B suggest as a solution?",
      difficulty: 2,
      choices: [
        { id: "el6q3a", label: "1", body: "Setting time limits on social media use", isCorrect: true },
        { id: "el6q3b", label: "2", body: "Deleting all social media accounts", isCorrect: false },
        { id: "el6q3c", label: "3", body: "Using social media only for homework", isCorrect: false },
        { id: "el6q3d", label: "4", body: "Replacing social media with phone calls", isCorrect: false },
      ],
      explanation: "Speaker Bの提案は「使用時間の制限」という現実的な解決策。極端な選択肢(削除・限定)を排除する。",
    },
  ],

  // ── 物理: 力学 (正答率86%) ──
  phys_rikigaku: [
    {
      id: "pr1", body: "質量 2.0 kg の物体に 6.0 N の力を加えたときの加速度は何 m/s² か。",
      difficulty: 1,
      choices: [
        { id: "pr1a", label: "1", body: "3.0 m/s²", isCorrect: true },
        { id: "pr1b", label: "2", body: "12 m/s²", isCorrect: false },
        { id: "pr1c", label: "3", body: "0.33 m/s²", isCorrect: false },
        { id: "pr1d", label: "4", body: "8.0 m/s²", isCorrect: false },
      ],
      explanation: "ニュートンの運動方程式 F = ma → a = F/m = 6.0/2.0 = 3.0 m/s²。",
    },
    {
      id: "pr2", body: "高さ 20 m から自由落下する物体が地面に達するまでの時間は約何秒か。(g = 10 m/s²)",
      difficulty: 2,
      choices: [
        { id: "pr2a", label: "1", body: "2.0 秒", isCorrect: true },
        { id: "pr2b", label: "2", body: "4.0 秒", isCorrect: false },
        { id: "pr2c", label: "3", body: "1.4 秒", isCorrect: false },
        { id: "pr2d", label: "4", body: "√2 秒", isCorrect: false },
      ],
      explanation: "h = (1/2)gt² → t = √(2h/g) = √(2×20/10) = √4 = 2.0 秒。",
    },
    {
      id: "pr3", body: "水平面上で 10 N の力で物体を 5.0 m 動かしたとき、力がした仕事は何 J か。(力と移動方向は同じ)",
      difficulty: 1,
      choices: [
        { id: "pr3a", label: "1", body: "50 J", isCorrect: true },
        { id: "pr3b", label: "2", body: "2.0 J", isCorrect: false },
        { id: "pr3c", label: "3", body: "15 J", isCorrect: false },
        { id: "pr3d", label: "4", body: "500 J", isCorrect: false },
      ],
      explanation: "仕事 W = Fd cos θ = 10 × 5.0 × cos 0° = 50 J。力と移動方向が同じなので cos 0° = 1。",
    },
  ],

  // ── 物理: 熱力学 (正答率78%) ──
  phys_netsuri: [
    {
      id: "pn1", body: "100 g の水の温度を 20°C から 70°C に上げるのに必要な熱量は何 kJ か。(水の比熱: 4.2 J/(g·K))",
      difficulty: 2,
      choices: [
        { id: "pn1a", label: "1", body: "21 kJ", isCorrect: true },
        { id: "pn1b", label: "2", body: "29.4 kJ", isCorrect: false },
        { id: "pn1c", label: "3", body: "4.2 kJ", isCorrect: false },
        { id: "pn1d", label: "4", body: "42 kJ", isCorrect: false },
      ],
      explanation: "Q = mcΔT = 100 × 4.2 × (70 - 20) = 100 × 4.2 × 50 = 21000 J = 21 kJ。",
    },
    {
      id: "pn2", body: "熱力学第一法則 ΔU = Q - W において、気体が外部に仕事をしながら熱を吸収し内部エネルギーが変化しない場合、Q と W の関係はどれか。",
      difficulty: 3,
      choices: [
        { id: "pn2a", label: "1", body: "Q = W", isCorrect: true },
        { id: "pn2b", label: "2", body: "Q > W", isCorrect: false },
        { id: "pn2c", label: "3", body: "Q < W", isCorrect: false },
        { id: "pn2d", label: "4", body: "Q = 0", isCorrect: false },
      ],
      explanation: "ΔU = 0 のとき Q = W。吸収した熱がすべて仕事に変換される（等温過程）。",
    },
    {
      id: "pn3", body: "理想気体の状態方程式として正しいものはどれか。",
      difficulty: 1,
      choices: [
        { id: "pn3a", label: "1", body: "PV = nRT", isCorrect: true },
        { id: "pn3b", label: "2", body: "PV = mRT", isCorrect: false },
        { id: "pn3c", label: "3", body: "PT = nRV", isCorrect: false },
        { id: "pn3d", label: "4", body: "PV = nR/T", isCorrect: false },
      ],
      explanation: "理想気体の状態方程式 PV = nRT。P: 圧力, V: 体積, n: 物質量(mol), R: 気体定数, T: 絶対温度。",
    },
  ],

  // ── 物理: 波動 (正答率68%) ──
  phys_hadou: [
    {
      id: "ph1", body: "振動数 500 Hz、波長 0.68 m の音波の速さは何 m/s か。",
      difficulty: 1,
      choices: [
        { id: "ph1a", label: "1", body: "340 m/s", isCorrect: true },
        { id: "ph1b", label: "2", body: "735 m/s", isCorrect: false },
        { id: "ph1c", label: "3", body: "170 m/s", isCorrect: false },
        { id: "ph1d", label: "4", body: "500 m/s", isCorrect: false },
      ],
      explanation: "v = fλ = 500 × 0.68 = 340 m/s。波の基本式。音速 340 m/s は共通テスト頻出の値。",
    },
    {
      id: "ph2", body: "光が水中からガラスに進むとき、入射角 > 屈折角 となる条件はどれか。",
      difficulty: 2,
      choices: [
        { id: "ph2a", label: "1", body: "ガラスの屈折率が水より大きい場合", isCorrect: true },
        { id: "ph2b", label: "2", body: "ガラスの屈折率が水より小さい場合", isCorrect: false },
        { id: "ph2c", label: "3", body: "光の波長が長い場合", isCorrect: false },
        { id: "ph2d", label: "4", body: "光の速度が速い場合", isCorrect: false },
      ],
      explanation: "スネルの法則: n₁ sinθ₁ = n₂ sinθ₂。n₂ > n₁ なら sinθ₂ < sinθ₁ → θ₂ < θ₁（屈折角 < 入射角）。屈折率が大きい媒質に入ると光は法線に近づく。",
    },
    {
      id: "ph3", body: "弦の固有振動で、基本振動（1倍振動）のとき、弦の長さ L と波長 λ の関係はどれか。",
      difficulty: 2,
      choices: [
        { id: "ph3a", label: "1", body: "L = λ/2", isCorrect: true },
        { id: "ph3b", label: "2", body: "L = λ", isCorrect: false },
        { id: "ph3c", label: "3", body: "L = 2λ", isCorrect: false },
        { id: "ph3d", label: "4", body: "L = λ/4", isCorrect: false },
      ],
      explanation: "両端固定の弦の基本振動: 両端が節、中央が腹で、弦の長さは半波長分。L = λ/2。",
    },
  ],

  // ── 物理: 原子 (正答率67%) ──
  phys_genshi: [
    {
      id: "pg1", body: "光電効果において、光の振動数を大きくすると飛び出す電子の最大運動エネルギーはどうなるか。",
      difficulty: 2,
      choices: [
        { id: "pg1a", label: "1", body: "大きくなる", isCorrect: true },
        { id: "pg1b", label: "2", body: "小さくなる", isCorrect: false },
        { id: "pg1c", label: "3", body: "変わらない", isCorrect: false },
        { id: "pg1d", label: "4", body: "振動数には依存しない", isCorrect: false },
      ],
      explanation: "アインシュタインの光電効果の式: (1/2)mv² = hf - W。振動数 f が大きくなると光子のエネルギー hf が増え、最大運動エネルギーも増加する。",
    },
    {
      id: "pg2", body: "α線の正体として正しいものはどれか。",
      difficulty: 1,
      choices: [
        { id: "pg2a", label: "1", body: "ヘリウム原子核", isCorrect: true },
        { id: "pg2b", label: "2", body: "電子", isCorrect: false },
        { id: "pg2c", label: "3", body: "光子", isCorrect: false },
        { id: "pg2d", label: "4", body: "中性子", isCorrect: false },
      ],
      explanation: "α線 = ヘリウム原子核(⁴He)、β線 = 電子、γ線 = 電磁波(光子)。放射線の基本知識。",
    },
    {
      id: "pg3", body: "半減期が 8 日の放射性物質が最初 800 g あるとき、24 日後に残る量は何 g か。",
      difficulty: 2,
      choices: [
        { id: "pg3a", label: "1", body: "100 g", isCorrect: true },
        { id: "pg3b", label: "2", body: "200 g", isCorrect: false },
        { id: "pg3c", label: "3", body: "50 g", isCorrect: false },
        { id: "pg3d", label: "4", body: "400 g", isCorrect: false },
      ],
      explanation: "24日 ÷ 8日 = 3半減期。800 × (1/2)³ = 800 × 1/8 = 100 g。",
    },
  ],

  // ── 化学: 理論化学 (正答率74%) ──
  chem_riron: [
    {
      id: "cr1", body: "0.10 mol/L の NaOH 水溶液 200 mL に含まれる NaOH の物質量は何 mol か。",
      difficulty: 1,
      choices: [
        { id: "cr1a", label: "1", body: "0.020 mol", isCorrect: true },
        { id: "cr1b", label: "2", body: "0.10 mol", isCorrect: false },
        { id: "cr1c", label: "3", body: "0.20 mol", isCorrect: false },
        { id: "cr1d", label: "4", body: "2.0 mol", isCorrect: false },
      ],
      explanation: "n = C × V = 0.10 × 0.200 = 0.020 mol。体積の単位を L に変換すること (200 mL = 0.200 L)。",
    },
    {
      id: "cr2", body: "pH = 3 の塩酸の水素イオン濃度は何 mol/L か。",
      difficulty: 2,
      choices: [
        { id: "cr2a", label: "1", body: "1.0 × 10⁻³ mol/L", isCorrect: true },
        { id: "cr2b", label: "2", body: "3.0 mol/L", isCorrect: false },
        { id: "cr2c", label: "3", body: "1.0 × 10⁻¹ mol/L", isCorrect: false },
        { id: "cr2d", label: "4", body: "1.0 × 10³ mol/L", isCorrect: false },
      ],
      explanation: "pH = -log[H⁺] → [H⁺] = 10⁻ᵖᴴ = 10⁻³ = 1.0 × 10⁻³ mol/L。pH の定義式。",
    },
    {
      id: "cr3", body: "ルシャトリエの原理について、発熱反応の平衡を右に移動させるにはどうすればよいか。",
      difficulty: 3,
      choices: [
        { id: "cr3a", label: "1", body: "温度を下げる", isCorrect: true },
        { id: "cr3b", label: "2", body: "温度を上げる", isCorrect: false },
        { id: "cr3c", label: "3", body: "触媒を加える", isCorrect: false },
        { id: "cr3d", label: "4", body: "圧力に関係なく変化する", isCorrect: false },
      ],
      explanation: "発熱反応に対して温度を下げると、平衡は熱を生じる方向（右）に移動する。触媒は平衡の位置を変えない（反応速度のみ変える）。",
    },
  ],

  // ── 化学: 無機化学 (正答率75%) ──
  chem_muki: [
    {
      id: "cm1", body: "アルカリ金属の性質として誤っているものはどれか。",
      difficulty: 2,
      choices: [
        { id: "cm1a", label: "1", body: "水に沈む（密度が大きい）", isCorrect: true },
        { id: "cm1b", label: "2", body: "水と激しく反応する", isCorrect: false },
        { id: "cm1c", label: "3", body: "1価の陽イオンになりやすい", isCorrect: false },
        { id: "cm1d", label: "4", body: "炎色反応を示す", isCorrect: false },
      ],
      explanation: "アルカリ金属(Li, Na, K等)は密度が小さく水に浮く（Liは最も密度が小さい金属）。水と激しく反応し、1価の陽イオンを形成し、炎色反応を示す。",
    },
    {
      id: "cm2", body: "鉄(III)イオン Fe³⁺ の水溶液に NaOH 水溶液を加えると生じる沈殿の色は？",
      difficulty: 2,
      choices: [
        { id: "cm2a", label: "1", body: "赤褐色", isCorrect: true },
        { id: "cm2b", label: "2", body: "白色", isCorrect: false },
        { id: "cm2c", label: "3", body: "緑白色", isCorrect: false },
        { id: "cm2d", label: "4", body: "青白色", isCorrect: false },
      ],
      explanation: "Fe³⁺ + 3OH⁻ → Fe(OH)₃↓（赤褐色）。Fe²⁺ なら Fe(OH)₂↓（緑白色）。イオンの価数による沈殿の色の違いを覚える。",
    },
    {
      id: "cm3", body: "ハーバー・ボッシュ法で合成される物質はどれか。",
      difficulty: 1,
      choices: [
        { id: "cm3a", label: "1", body: "アンモニア", isCorrect: true },
        { id: "cm3b", label: "2", body: "硫酸", isCorrect: false },
        { id: "cm3c", label: "3", body: "塩酸", isCorrect: false },
        { id: "cm3d", label: "4", body: "硝酸", isCorrect: false },
      ],
      explanation: "ハーバー・ボッシュ法: N₂ + 3H₂ → 2NH₃（高温高圧、鉄触媒）。工業的アンモニア合成法。硫酸は接触法、硝酸はオストワルト法。",
    },
  ],

  // ── 化学: 高分子 (正答率57%) ──
  chem_koubun: [
    {
      id: "ck1", body: "ポリエチレンテレフタラート(PET)の分類として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "ck1a", label: "1", body: "縮合重合による合成繊維", isCorrect: true },
        { id: "ck1b", label: "2", body: "付加重合によるプラスチック", isCorrect: false },
        { id: "ck1c", label: "3", body: "天然高分子", isCorrect: false },
        { id: "ck1d", label: "4", body: "合成ゴム", isCorrect: false },
      ],
      explanation: "PETはテレフタル酸とエチレングリコールの縮合重合で合成されるポリエステル。ペットボトルの素材として有名。エステル結合で連結。",
    },
    {
      id: "ck2", body: "デンプンとセルロースの共通点として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "ck2a", label: "1", body: "どちらもグルコースが多数結合した多糖類である", isCorrect: true },
        { id: "ck2b", label: "2", body: "どちらもヨウ素液で青紫色に呈色する", isCorrect: false },
        { id: "ck2c", label: "3", body: "どちらも人間の消化酵素で分解できる", isCorrect: false },
        { id: "ck2d", label: "4", body: "どちらも水に溶けやすい", isCorrect: false },
      ],
      explanation: "デンプンもセルロースもグルコース(C₆H₁₂O₆)の多糖類だが、結合の仕方(α結合 vs β結合)が異なる。ヨウ素反応はデンプンのみ、人はセルロースを消化できない。",
    },
    {
      id: "ck3", body: "アミノ酸どうしを結合する化学結合の名称はどれか。",
      difficulty: 1,
      choices: [
        { id: "ck3a", label: "1", body: "ペプチド結合", isCorrect: true },
        { id: "ck3b", label: "2", body: "グリコシド結合", isCorrect: false },
        { id: "ck3c", label: "3", body: "エステル結合", isCorrect: false },
        { id: "ck3d", label: "4", body: "水素結合", isCorrect: false },
      ],
      explanation: "アミノ酸の-COOH と -NH₂ が脱水縮合してペプチド結合(-CO-NH-)を形成。グリコシド結合は糖同士、エステル結合は酸とアルコール。",
    },
  ],

  // ── 社会: 自然環境 (正答率75%) ──
  soc_shizen: [
    {
      id: "ss1", body: "プレートの境界のうち、海溝が形成されるのはどのような境界か。",
      difficulty: 2,
      choices: [
        { id: "ss1a", label: "1", body: "収束境界（沈み込み帯）", isCorrect: true },
        { id: "ss1b", label: "2", body: "発散境界", isCorrect: false },
        { id: "ss1c", label: "3", body: "すれ違い境界（トランスフォーム断層）", isCorrect: false },
        { id: "ss1d", label: "4", body: "ホットスポット", isCorrect: false },
      ],
      explanation: "海溝は海洋プレートが大陸プレートの下に沈み込む収束境界に形成される。日本海溝、マリアナ海溝が代表例。発散境界では海嶺が形成される。",
    },
    {
      id: "ss2", body: "ケッペンの気候区分で、Af が示す気候帯はどれか。",
      difficulty: 2,
      choices: [
        { id: "ss2a", label: "1", body: "熱帯雨林気候", isCorrect: true },
        { id: "ss2b", label: "2", body: "サバナ気候", isCorrect: false },
        { id: "ss2c", label: "3", body: "地中海性気候", isCorrect: false },
        { id: "ss2d", label: "4", body: "ステップ気候", isCorrect: false },
      ],
      explanation: "A = 熱帯、f = 年中湿潤。Af = 熱帯雨林気候。Aw がサバナ気候、Cs が地中海性気候、BS がステップ気候。",
    },
    {
      id: "ss3", body: "偏西風が吹く緯度帯として最も適切なものはどれか。",
      difficulty: 1,
      choices: [
        { id: "ss3a", label: "1", body: "中緯度（30°～60°）", isCorrect: true },
        { id: "ss3b", label: "2", body: "低緯度（0°～30°）", isCorrect: false },
        { id: "ss3c", label: "3", body: "高緯度（60°～90°）", isCorrect: false },
        { id: "ss3d", label: "4", body: "赤道付近", isCorrect: false },
      ],
      explanation: "偏西風は中緯度(30°～60°)で西から東に吹く恒常風。低緯度は貿易風、高緯度は極東風。大気大循環の基本。",
    },
  ],

  // ── 社会: 資源と産業 (正答率61%) ──
  soc_shigen: [
    {
      id: "sg1", body: "世界の原油生産量が最も多い国（2020年代）はどれか。",
      difficulty: 2,
      choices: [
        { id: "sg1a", label: "1", body: "アメリカ合衆国", isCorrect: true },
        { id: "sg1b", label: "2", body: "サウジアラビア", isCorrect: false },
        { id: "sg1c", label: "3", body: "ロシア", isCorrect: false },
        { id: "sg1d", label: "4", body: "中国", isCorrect: false },
      ],
      explanation: "シェール革命以降、アメリカが世界最大の原油生産国（2020年代）。サウジアラビア、ロシアが続く。統計の更新に注意。",
    },
    {
      id: "sg2", body: "フェアトレードの目的として最も適切なものはどれか。",
      difficulty: 1,
      choices: [
        { id: "sg2a", label: "1", body: "発展途上国の生産者に公正な対価を支払い、生活向上を支援する", isCorrect: true },
        { id: "sg2b", label: "2", body: "先進国間の関税を撤廃する", isCorrect: false },
        { id: "sg2c", label: "3", body: "輸入品の品質基準を厳格化する", isCorrect: false },
        { id: "sg2d", label: "4", body: "国内産業を保護する", isCorrect: false },
      ],
      explanation: "フェアトレード(公正貿易)は、途上国の生産者に適正な価格を保証し、持続可能な発展を支援する貿易の仕組み。コーヒー・カカオなどが代表的。",
    },
    {
      id: "sg3", body: "「グリーン革命」が主に行われた地域と内容の組み合わせとして正しいものはどれか。",
      difficulty: 3,
      choices: [
        { id: "sg3a", label: "1", body: "アジア — 高収量品種の導入による穀物増産", isCorrect: true },
        { id: "sg3b", label: "2", body: "アフリカ — 森林の大規模植林", isCorrect: false },
        { id: "sg3c", label: "3", body: "ヨーロッパ — 再生可能エネルギーの普及", isCorrect: false },
        { id: "sg3d", label: "4", body: "南米 — 有機農業への転換", isCorrect: false },
      ],
      explanation: "グリーン革命(1960年代～)は主にアジアで、高収量品種(HYV)の導入・灌漑・化学肥料により穀物(特に米・小麦)の生産を飛躍的に増大させた。",
    },
  ],

  // ── 社会: 生活文化 (正答率56%) ──
  soc_chiiki: [
    {
      id: "sc1", body: "イスラム教徒の生活習慣として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "sc1a", label: "1", body: "豚肉を食べない", isCorrect: true },
        { id: "sc1b", label: "2", body: "牛肉を食べない", isCorrect: false },
        { id: "sc1c", label: "3", body: "日曜日に礼拝する", isCorrect: false },
        { id: "sc1d", label: "4", body: "断食は行わない", isCorrect: false },
      ],
      explanation: "イスラム教では豚肉が禁忌(ハラーム)。牛肉禁忌はヒンドゥー教。礼拝は1日5回で金曜日が集団礼拝。ラマダーン月に断食を行う。",
    },
    {
      id: "sc2", body: "東南アジアの住居に高床式の家が多い理由として最も適切なものはどれか。",
      difficulty: 2,
      choices: [
        { id: "sc2a", label: "1", body: "高温多湿の気候で通気性を確保し、洪水・害虫対策のため", isCorrect: true },
        { id: "sc2b", label: "2", body: "地震に対する耐震構造のため", isCorrect: false },
        { id: "sc2c", label: "3", body: "積雪に備えるため", isCorrect: false },
        { id: "sc2d", label: "4", body: "外敵からの防御のため", isCorrect: false },
      ],
      explanation: "東南アジアの高床式住居は、高温多湿な熱帯気候に対応。床下の空間が通気性を確保し、雨季の洪水や害虫・害獣から家財を守る。気候と住居の関係は頻出。",
    },
    {
      id: "sc3", body: "公用語が複数設定されている国の例として正しいものはどれか。",
      difficulty: 1,
      choices: [
        { id: "sc3a", label: "1", body: "スイス（ドイツ語・フランス語・イタリア語・ロマンシュ語）", isCorrect: true },
        { id: "sc3b", label: "2", body: "日本（日本語・英語）", isCorrect: false },
        { id: "sc3c", label: "3", body: "フランス（フランス語・ドイツ語）", isCorrect: false },
        { id: "sc3d", label: "4", body: "韓国（韓国語・中国語）", isCorrect: false },
      ],
      explanation: "スイスは4つの公用語を持つ多言語国家の代表例。ベルギー（オランダ語・フランス語・ドイツ語）やカナダ（英語・フランス語）も多言語国家。",
    },
  ],

  // ── 社会: 地図・地域 (正答率67%) ──
  soc_chizu: [
    {
      id: "sz1", body: "メルカトル図法の特徴として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "sz1a", label: "1", body: "角度が正しく表される（正角図法）", isCorrect: true },
        { id: "sz1b", label: "2", body: "面積が正しく表される（正積図法）", isCorrect: false },
        { id: "sz1c", label: "3", body: "距離が正しく表される（正距図法）", isCorrect: false },
        { id: "sz1d", label: "4", body: "方位が正しく表される（正方位図法）", isCorrect: false },
      ],
      explanation: "メルカトル図法は正角図法で、航海に適する。高緯度ほど面積が拡大される欠点がある。モルワイデ図法が正積図法、正距方位図法が中心からの距離・方位を正しく表す。",
    },
    {
      id: "sz2", body: "2万5千分の1の地形図で、地図上の 4 cm は実際の何 m か。",
      difficulty: 1,
      choices: [
        { id: "sz2a", label: "1", body: "1000 m", isCorrect: true },
        { id: "sz2b", label: "2", body: "100 m", isCorrect: false },
        { id: "sz2c", label: "3", body: "250 m", isCorrect: false },
        { id: "sz2d", label: "4", body: "10000 m", isCorrect: false },
      ],
      explanation: "4 cm × 25000 = 100000 cm = 1000 m = 1 km。縮尺の計算は共通テスト地理の基本問題。",
    },
    {
      id: "sz3", body: "地形図の等高線が密な場所はどのような地形を示すか。",
      difficulty: 1,
      choices: [
        { id: "sz3a", label: "1", body: "急斜面", isCorrect: true },
        { id: "sz3b", label: "2", body: "緩斜面", isCorrect: false },
        { id: "sz3c", label: "3", body: "平地", isCorrect: false },
        { id: "sz3d", label: "4", body: "窪地", isCorrect: false },
      ],
      explanation: "等高線の間隔が狭い（密な）場所は傾斜が急。間隔が広い場所は緩やか。等高線の読み取りは地形図問題の基本。",
    },
  ],

  // ── 情報I: 情報社会 (正答率87%) ──
  info_joho: [
    {
      id: "ij1", body: "個人情報保護法における「個人情報」の定義として正しいものはどれか。",
      difficulty: 1,
      choices: [
        { id: "ij1a", label: "1", body: "生存する個人に関する情報で、特定の個人を識別できるもの", isCorrect: true },
        { id: "ij1b", label: "2", body: "企業が保有するすべてのデータ", isCorrect: false },
        { id: "ij1c", label: "3", body: "インターネット上に公開されている情報", isCorrect: false },
        { id: "ij1d", label: "4", body: "電子化されたデータのみ", isCorrect: false },
      ],
      explanation: "個人情報 = 生存する個人に関する情報で、氏名・生年月日等により特定の個人を識別できるもの。紙の情報も含む。死者の情報は対象外。",
    },
    {
      id: "ij2", body: "著作権法で保護されないものはどれか。",
      difficulty: 2,
      choices: [
        { id: "ij2a", label: "1", body: "数学の公式", isCorrect: true },
        { id: "ij2b", label: "2", body: "小説の文章", isCorrect: false },
        { id: "ij2c", label: "3", body: "写真作品", isCorrect: false },
        { id: "ij2d", label: "4", body: "作曲した音楽", isCorrect: false },
      ],
      explanation: "著作権法はアイデアや事実・データそのものは保護しない。数学の公式、歴史的事実、法令などは著作物ではない。「表現」を保護する法律。",
    },
    {
      id: "ij3", body: "情報セキュリティの3要素(CIA)に含まれないものはどれか。",
      difficulty: 2,
      choices: [
        { id: "ij3a", label: "1", body: "効率性(Efficiency)", isCorrect: true },
        { id: "ij3b", label: "2", body: "機密性(Confidentiality)", isCorrect: false },
        { id: "ij3c", label: "3", body: "完全性(Integrity)", isCorrect: false },
        { id: "ij3d", label: "4", body: "可用性(Availability)", isCorrect: false },
      ],
      explanation: "情報セキュリティの3要素(CIA): 機密性(Confidentiality)、完全性(Integrity)、可用性(Availability)。効率性は含まれない。",
    },
  ],

  // ── 情報I: 情報デザイン (正答率79%) ──
  info_comm: [
    {
      id: "id1", body: "ユニバーサルデザインの原則として最も適切なものはどれか。",
      difficulty: 1,
      choices: [
        { id: "id1a", label: "1", body: "年齢・障害の有無にかかわらず、すべての人が利用できる設計", isCorrect: true },
        { id: "id1b", label: "2", body: "コストを最小限に抑えた設計", isCorrect: false },
        { id: "id1c", label: "3", body: "専門家のみが利用できる高機能設計", isCorrect: false },
        { id: "id1d", label: "4", body: "日本国内のみで通用する設計", isCorrect: false },
      ],
      explanation: "ユニバーサルデザインは「すべての人のためのデザイン」。7原則(公平性・柔軟性・単純性等)に基づく。バリアフリーは障害者向けだが、UDはすべての人が対象。",
    },
    {
      id: "id2", body: "情報のデジタル表現で、RGBカラーモデルの各色を8ビットで表す場合、表現できる色の総数はいくつか。",
      difficulty: 2,
      choices: [
        { id: "id2a", label: "1", body: "約1677万色", isCorrect: true },
        { id: "id2b", label: "2", body: "約65000色", isCorrect: false },
        { id: "id2c", label: "3", body: "約256色", isCorrect: false },
        { id: "id2d", label: "4", body: "約1000万色", isCorrect: false },
      ],
      explanation: "R, G, B 各8ビット = 各256段階。256³ = 16,777,216 ≈ 約1677万色。24ビットカラー(フルカラー)と呼ばれる。",
    },
    {
      id: "id3", body: "Webページのアクセシビリティ向上のために最も重要な対策はどれか。",
      difficulty: 2,
      choices: [
        { id: "id3a", label: "1", body: "画像に代替テキスト(alt属性)をつける", isCorrect: true },
        { id: "id3b", label: "2", body: "動画を多用する", isCorrect: false },
        { id: "id3c", label: "3", body: "文字サイズを固定する", isCorrect: false },
        { id: "id3d", label: "4", body: "Flash アニメーションを使う", isCorrect: false },
      ],
      explanation: "代替テキスト(alt属性)は画像を見られない環境(視覚障害者のスクリーンリーダー等)で画像の内容を伝える。Webアクセシビリティの基本。",
    },
  ],

  // ── 情報I: ネットワーク (正答率58%) ──
  info_network: [
    {
      id: "in1", body: "IPアドレスの説明として正しいものはどれか。",
      difficulty: 1,
      choices: [
        { id: "in1a", label: "1", body: "ネットワーク上のコンピュータを識別するための番号", isCorrect: true },
        { id: "in1b", label: "2", body: "Webサイトの名前を表す文字列", isCorrect: false },
        { id: "in1c", label: "3", body: "メールアドレスのこと", isCorrect: false },
        { id: "in1d", label: "4", body: "暗号化のための鍵", isCorrect: false },
      ],
      explanation: "IPアドレスはネットワーク上の機器を識別する番号。IPv4は32ビット(例: 192.168.1.1)、IPv6は128ビット。Webサイト名はドメイン名。",
    },
    {
      id: "in2", body: "HTTPSの「S」が意味する技術として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "in2a", label: "1", body: "SSL/TLSによる通信の暗号化", isCorrect: true },
        { id: "in2b", label: "2", body: "高速通信(Speed)", isCorrect: false },
        { id: "in2c", label: "3", body: "安全なサーバー(Secure Server)", isCorrect: false },
        { id: "in2d", label: "4", body: "ソーシャルメディア対応(Social)", isCorrect: false },
      ],
      explanation: "HTTPS = HTTP + SSL/TLS。Sは Secure を意味し、通信内容を暗号化する。オンラインショッピングや個人情報入力時に必須のセキュリティ技術。",
    },
    {
      id: "in3", body: "DNS の役割として正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "in3a", label: "1", body: "ドメイン名をIPアドレスに変換する", isCorrect: true },
        { id: "in3b", label: "2", body: "メールを送受信する", isCorrect: false },
        { id: "in3c", label: "3", body: "ファイルを転送する", isCorrect: false },
        { id: "in3d", label: "4", body: "Webページを表示する", isCorrect: false },
      ],
      explanation: "DNS(Domain Name System)はドメイン名(例: google.com)をIPアドレス(例: 142.250.xx.xx)に変換する「インターネットの電話帳」。メール送受信はSMTP/POP/IMAP。",
    },
  ],

  // ── 情報I: データ活用 (正答率75%) ──
  info_data: [
    {
      id: "ida1", body: "データベースで「正規化」を行う主な目的はどれか。",
      difficulty: 2,
      choices: [
        { id: "ida1a", label: "1", body: "データの重複を排除し、一貫性を保つ", isCorrect: true },
        { id: "ida1b", label: "2", body: "データの検索速度を上げる", isCorrect: false },
        { id: "ida1c", label: "3", body: "データを暗号化する", isCorrect: false },
        { id: "ida1d", label: "4", body: "データのバックアップを取る", isCorrect: false },
      ],
      explanation: "正規化はデータの重複を排除し、更新時の矛盾（更新異常・挿入異常・削除異常）を防ぐ。検索速度向上は索引(インデックス)の役割。",
    },
    {
      id: "ida2", body: "表計算ソフトで、A1からA10のセルの合計を求める関数はどれか。",
      difficulty: 1,
      choices: [
        { id: "ida2a", label: "1", body: "=SUM(A1:A10)", isCorrect: true },
        { id: "ida2b", label: "2", body: "=TOTAL(A1:A10)", isCorrect: false },
        { id: "ida2c", label: "3", body: "=ADD(A1,A10)", isCorrect: false },
        { id: "ida2d", label: "4", body: "=COUNT(A1:A10)", isCorrect: false },
      ],
      explanation: "SUM関数は指定範囲の合計値を計算。COUNT は個数、AVERAGE は平均値。表計算の基本関数は共通テスト頻出。",
    },
    {
      id: "ida3", body: "ヒストグラムと棒グラフの違いとして正しいものはどれか。",
      difficulty: 2,
      choices: [
        { id: "ida3a", label: "1", body: "ヒストグラムは連続データの度数分布を表し、棒が隙間なく並ぶ", isCorrect: true },
        { id: "ida3b", label: "2", body: "ヒストグラムは3次元、棒グラフは2次元", isCorrect: false },
        { id: "ida3c", label: "3", body: "ヒストグラムはカテゴリデータ用", isCorrect: false },
        { id: "ida3d", label: "4", body: "両者に本質的な違いはない", isCorrect: false },
      ],
      explanation: "ヒストグラムは量的(連続)データの度数分布を表し、棒が隙間なく接する。棒グラフは質的(カテゴリ)データの比較用で、棒の間に隙間がある。",
    },
  ],
};

/** 科目IDから日本語名を引く */
export const SUBJECT_NAMES: Record<string, string> = {
  kokugo: "国語", math1a: "数学IA", math2bc: "数学IIB/C",
  eng_read: "英語R", eng_listen: "英語L",
  physics: "物理", chemistry: "化学", social: "社会", info1: "情報I",
};
