/**
 * 3階層ヒートマップデータ
 * Level 1: 教科 (6ブロック: 国語/数学/英語/理科/社会/情報)
 * Level 2: 分野 (各教科内のフィールド)
 * Level 3: 単元 (各分野内のユニット)
 */

export interface UnitStat {
  unitId: string;
  unitName: string;
  total: number;
  correct: number;
  difficulty: number; // 平均難易度 1-5
  lastStudied: string | null; // 最終学習日
  reviewDue: number; // 復習待ち件数
}

export interface FieldDetail {
  fieldId: string;
  fieldName: string;
  subjectId: string;
  total: number;
  correct: number;
  points: number;
  units: UnitStat[];
}

export interface SubjectGroup {
  groupId: string;
  label: string;
  maxScore: number;
  color: string;
  subjectIds: string[];
  fields: FieldDetail[];
}

/** 教科カラー */
export const SUBJECT_COLORS: Record<string, string> = {
  kokugo: "#f97316",
  math: "#3b82f6",
  english: "#ec4899",
  science: "#14b8a6",
  social: "#eab308",
  info: "#06b6d4",
};

export const HIERARCHY_DATA: SubjectGroup[] = [
  {
    groupId: "kokugo", label: "国語", maxScore: 200, color: SUBJECT_COLORS.kokugo,
    subjectIds: ["kokugo"],
    fields: [
      {
        fieldId: "kokugo_gendai", fieldName: "現代文", subjectId: "kokugo", total: 40, correct: 32, points: 110,
        units: [
          { unitId: "gendai_hyoron", unitName: "評論", total: 20, correct: 17, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 2 },
          { unitId: "gendai_shosetsu", unitName: "小説", total: 12, correct: 10, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
          { unitId: "gendai_jitsuyou", unitName: "実用的文章", total: 8, correct: 5, difficulty: 2, lastStudied: "2026-03-25", reviewDue: 3 },
        ],
      },
      {
        fieldId: "kokugo_kobun", fieldName: "古文", subjectId: "kokugo", total: 35, correct: 19, points: 50,
        units: [
          { unitId: "kobun_bunpou", unitName: "文法(助動詞)", total: 15, correct: 8, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 5 },
          { unitId: "kobun_dokkai", unitName: "読解", total: 12, correct: 6, difficulty: 4, lastStudied: "2026-03-26", reviewDue: 4 },
          { unitId: "kobun_goi", unitName: "古語・語彙", total: 8, correct: 5, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 2 },
        ],
      },
      {
        fieldId: "kokugo_kanbun", fieldName: "漢文", subjectId: "kokugo", total: 30, correct: 15, points: 40,
        units: [
          { unitId: "kanbun_kunten", unitName: "句形・返り点", total: 15, correct: 8, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 6 },
          { unitId: "kanbun_dokkai", unitName: "読解", total: 10, correct: 4, difficulty: 4, lastStudied: "2026-03-24", reviewDue: 5 },
          { unitId: "kanbun_koji", unitName: "故事成語", total: 5, correct: 3, difficulty: 2, lastStudied: "2026-03-26", reviewDue: 1 },
        ],
      },
    ],
  },
  {
    groupId: "math", label: "数学", maxScore: 200, color: SUBJECT_COLORS.math,
    subjectIds: ["math1a", "math2bc"],
    fields: [
      { fieldId: "m1a_suushiki", fieldName: "数と式", subjectId: "math1a", total: 30, correct: 27, points: 15, units: [
        { unitId: "suushiki_tenkai", unitName: "展開・因数分解", total: 15, correct: 14, difficulty: 2, lastStudied: "2026-03-29", reviewDue: 0 },
        { unitId: "suushiki_shuugo", unitName: "集合と論理", total: 15, correct: 13, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
      ]},
      { fieldId: "m1a_niji", fieldName: "2次関数", subjectId: "math1a", total: 28, correct: 24, points: 15, units: [
        { unitId: "niji_graph", unitName: "グラフと最大最小", total: 15, correct: 13, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 1 },
        { unitId: "niji_houteishiki", unitName: "2次方程式・不等式", total: 13, correct: 11, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 0 },
      ]},
      { fieldId: "m1a_jougo", fieldName: "場合の数・確率", subjectId: "math1a", total: 35, correct: 21, points: 20, units: [
        { unitId: "jougo_junretsu", unitName: "順列・組合せ", total: 15, correct: 10, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 3 },
        { unitId: "jougo_kakuritsu", unitName: "確率", total: 12, correct: 6, difficulty: 4, lastStudied: "2026-03-27", reviewDue: 4 },
        { unitId: "jougo_joukentuki", unitName: "条件付き確率", total: 8, correct: 5, difficulty: 4, lastStudied: "2026-03-26", reviewDue: 2 },
      ]},
      { fieldId: "m1a_zukei", fieldName: "図形と計量", subjectId: "math1a", total: 25, correct: 19, points: 20, units: [
        { unitId: "zukei_sankaku", unitName: "三角比", total: 13, correct: 10, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "zukei_seigen", unitName: "正弦定理・余弦定理", total: 12, correct: 9, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 2 },
      ]},
      { fieldId: "m1a_data", fieldName: "データ分析", subjectId: "math1a", total: 20, correct: 16, points: 15, units: [
        { unitId: "data_daihyo", unitName: "代表値・分散", total: 12, correct: 10, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 0 },
        { unitId: "data_soukan", unitName: "相関・回帰", total: 8, correct: 6, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
      ]},
      { fieldId: "m1a_seishitsu", fieldName: "図形の性質", subjectId: "math1a", total: 18, correct: 13, points: 15, units: [
        { unitId: "seishitsu_en", unitName: "円の性質", total: 10, correct: 7, difficulty: 3, lastStudied: "2026-03-26", reviewDue: 2 },
        { unitId: "seishitsu_kukan", unitName: "空間図形", total: 8, correct: 6, difficulty: 3, lastStudied: "2026-03-25", reviewDue: 1 },
      ]},
      { fieldId: "m2bc_bibun", fieldName: "微分・積分", subjectId: "math2bc", total: 30, correct: 22, points: 20, units: [
        { unitId: "bibun_bibun", unitName: "微分法", total: 15, correct: 12, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 1 },
        { unitId: "bibun_sekibun", unitName: "積分法", total: 15, correct: 10, difficulty: 4, lastStudied: "2026-03-28", reviewDue: 3 },
      ]},
      { fieldId: "m2bc_vector", fieldName: "ベクトル", subjectId: "math2bc", total: 24, correct: 13, points: 15, units: [
        { unitId: "vector_heimen", unitName: "平面ベクトル", total: 12, correct: 7, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 3 },
        { unitId: "vector_kukan", unitName: "空間ベクトル", total: 12, correct: 6, difficulty: 4, lastStudied: "2026-03-27", reviewDue: 4 },
      ]},
      { fieldId: "m2bc_suuretsu", fieldName: "数列", subjectId: "math2bc", total: 25, correct: 19, points: 15, units: [
        { unitId: "suuretsu_toutou", unitName: "等差・等比数列", total: 13, correct: 11, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "suuretsu_zenka", unitName: "漸化式", total: 12, correct: 8, difficulty: 4, lastStudied: "2026-03-27", reviewDue: 3 },
      ]},
      { fieldId: "m2bc_kansuu", fieldName: "三角・指数対数", subjectId: "math2bc", total: 28, correct: 20, points: 20, units: [
        { unitId: "kansuu_sankaku", unitName: "三角関数", total: 14, correct: 10, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 2 },
        { unitId: "kansuu_shisuu", unitName: "指数・対数", total: 14, correct: 10, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 1 },
      ]},
      { fieldId: "m2bc_shiki", fieldName: "式と証明", subjectId: "math2bc", total: 22, correct: 18, points: 15, units: [
        { unitId: "shiki_fukusosu", unitName: "複素数", total: 12, correct: 10, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "shiki_shoumei", unitName: "等式・不等式の証明", total: 10, correct: 8, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 0 },
      ]},
      { fieldId: "m2bc_toukei", fieldName: "統計的推測", subjectId: "math2bc", total: 15, correct: 11, points: 15, units: [
        { unitId: "toukei_bunpu", unitName: "確率分布", total: 8, correct: 6, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
        { unitId: "toukei_suisoku", unitName: "統計的推測", total: 7, correct: 5, difficulty: 4, lastStudied: "2026-03-26", reviewDue: 2 },
      ]},
    ],
  },
  {
    groupId: "english", label: "英語", maxScore: 200, color: SUBJECT_COLORS.english,
    subjectIds: ["eng_read", "eng_listen"],
    fields: [
      { fieldId: "engr_q1", fieldName: "R第1問 短文", subjectId: "eng_read", total: 20, correct: 18, points: 10, units: [
        { unitId: "engr1_ad", unitName: "広告・掲示", total: 10, correct: 9, difficulty: 1, lastStudied: "2026-03-29", reviewDue: 0 },
        { unitId: "engr1_email", unitName: "メール・短文", total: 10, correct: 9, difficulty: 1, lastStudied: "2026-03-28", reviewDue: 0 },
      ]},
      { fieldId: "engr_q2", fieldName: "R第2問 情報検索", subjectId: "eng_read", total: 20, correct: 17, points: 20, units: [
        { unitId: "engr2_web", unitName: "ウェブサイト", total: 10, correct: 9, difficulty: 2, lastStudied: "2026-03-29", reviewDue: 0 },
        { unitId: "engr2_leaflet", unitName: "リーフレット", total: 10, correct: 8, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
      ]},
      { fieldId: "engr_q3", fieldName: "R第3問 要旨把握", subjectId: "eng_read", total: 18, correct: 14, points: 15, units: [
        { unitId: "engr3_blog", unitName: "ブログ・記事", total: 10, correct: 8, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "engr3_narr", unitName: "短いナラティブ", total: 8, correct: 6, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
      ]},
      { fieldId: "engr_q5", fieldName: "R第5問 物語文", subjectId: "eng_read", total: 15, correct: 9, points: 15, units: [
        { unitId: "engr5_story", unitName: "物語読解", total: 15, correct: 9, difficulty: 4, lastStudied: "2026-03-27", reviewDue: 4 },
      ]},
      { fieldId: "engr_q6", fieldName: "R第6問 論説文", subjectId: "eng_read", total: 18, correct: 10, points: 24, units: [
        { unitId: "engr6_essay", unitName: "論説読解", total: 10, correct: 5, difficulty: 4, lastStudied: "2026-03-28", reviewDue: 4 },
        { unitId: "engr6_summary", unitName: "要約・論点整理", total: 8, correct: 5, difficulty: 4, lastStudied: "2026-03-26", reviewDue: 3 },
      ]},
      { fieldId: "engl_q1", fieldName: "L第1問 短い対話", subjectId: "eng_listen", total: 20, correct: 18, points: 25, units: [
        { unitId: "engl1_short", unitName: "短い対話", total: 20, correct: 18, difficulty: 1, lastStudied: "2026-03-29", reviewDue: 0 },
      ]},
      { fieldId: "engl_q5", fieldName: "L第5問 講義", subjectId: "eng_listen", total: 14, correct: 6, points: 15, units: [
        { unitId: "engl5_lecture", unitName: "講義聴解", total: 14, correct: 6, difficulty: 5, lastStudied: "2026-03-28", reviewDue: 6 },
      ]},
      { fieldId: "engl_q6", fieldName: "L第6問 長い対話", subjectId: "eng_listen", total: 14, correct: 7, points: 14, units: [
        { unitId: "engl6_long", unitName: "長い対話聴解", total: 14, correct: 7, difficulty: 4, lastStudied: "2026-03-27", reviewDue: 5 },
      ]},
    ],
  },
  {
    groupId: "science", label: "理科", maxScore: 200, color: SUBJECT_COLORS.science,
    subjectIds: ["physics", "chemistry"],
    fields: [
      { fieldId: "phys_rikigaku", fieldName: "力学", subjectId: "physics", total: 35, correct: 30, points: 30, units: [
        { unitId: "riki_undou", unitName: "等加速度運動", total: 12, correct: 11, difficulty: 2, lastStudied: "2026-03-29", reviewDue: 0 },
        { unitId: "riki_chikara", unitName: "力のつりあい", total: 11, correct: 10, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 0 },
        { unitId: "riki_energy", unitName: "エネルギー保存", total: 12, correct: 9, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 1 },
      ]},
      { fieldId: "phys_denki", fieldName: "電磁気", subjectId: "physics", total: 28, correct: 17, points: 25, units: [
        { unitId: "denki_denba", unitName: "電場・電位", total: 10, correct: 6, difficulty: 4, lastStudied: "2026-03-28", reviewDue: 3 },
        { unitId: "denki_kairo", unitName: "直流回路", total: 10, correct: 6, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 3 },
        { unitId: "denki_jiба", unitName: "電磁誘導", total: 8, correct: 5, difficulty: 4, lastStudied: "2026-03-27", reviewDue: 2 },
      ]},
      { fieldId: "phys_hadou", fieldName: "波動", subjectId: "physics", total: 22, correct: 15, points: 20, units: [
        { unitId: "hadou_nami", unitName: "波の性質", total: 12, correct: 9, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 2 },
        { unitId: "hadou_oto", unitName: "音・光", total: 10, correct: 6, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 3 },
      ]},
      { fieldId: "phys_netsuri", fieldName: "熱力学", subjectId: "physics", total: 18, correct: 14, points: 15, units: [
        { unitId: "netsuri_houteishiki", unitName: "熱力学第一法則", total: 10, correct: 8, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "netsuri_kitai", unitName: "気体の状態変化", total: 8, correct: 6, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
      ]},
      { fieldId: "phys_genshi", fieldName: "原子", subjectId: "physics", total: 12, correct: 8, points: 10, units: [
        { unitId: "genshi_kouzou", unitName: "原子構造", total: 12, correct: 8, difficulty: 3, lastStudied: "2026-03-26", reviewDue: 2 },
      ]},
      { fieldId: "chem_riron", fieldName: "理論化学", subjectId: "chemistry", total: 35, correct: 26, points: 35, units: [
        { unitId: "riron_genshi", unitName: "原子の構造", total: 10, correct: 8, difficulty: 2, lastStudied: "2026-03-29", reviewDue: 1 },
        { unitId: "riron_mol", unitName: "物質量(mol)", total: 10, correct: 8, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "riron_netsuri", unitName: "熱化学", total: 8, correct: 5, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 2 },
        { unitId: "riron_heiko", unitName: "化学平衡", total: 7, correct: 5, difficulty: 4, lastStudied: "2026-03-26", reviewDue: 1 },
      ]},
      { fieldId: "chem_yuuki", fieldName: "有機化学", subjectId: "chemistry", total: 25, correct: 12, points: 30, units: [
        { unitId: "yuuki_shihousoku", unitName: "脂肪族", total: 10, correct: 5, difficulty: 3, lastStudied: "2026-03-29", reviewDue: 4 },
        { unitId: "yuuki_houkou", unitName: "芳香族", total: 10, correct: 4, difficulty: 4, lastStudied: "2026-03-28", reviewDue: 5 },
        { unitId: "yuuki_kouzou", unitName: "構造決定", total: 5, correct: 3, difficulty: 5, lastStudied: "2026-03-27", reviewDue: 2 },
      ]},
      { fieldId: "chem_muki", fieldName: "無機化学", subjectId: "chemistry", total: 20, correct: 15, points: 20, units: [
        { unitId: "muki_kinzoku", unitName: "金属元素", total: 10, correct: 8, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "muki_hikinzoku", unitName: "非金属元素", total: 10, correct: 7, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 2 },
      ]},
      { fieldId: "chem_koubun", fieldName: "高分子", subjectId: "chemistry", total: 14, correct: 8, points: 15, units: [
        { unitId: "koubun_gousei", unitName: "合成高分子", total: 7, correct: 4, difficulty: 3, lastStudied: "2026-03-26", reviewDue: 2 },
        { unitId: "koubun_tennen", unitName: "天然高分子", total: 7, correct: 4, difficulty: 3, lastStudied: "2026-03-25", reviewDue: 3 },
      ]},
    ],
  },
  {
    groupId: "social", label: "社会", maxScore: 100, color: SUBJECT_COLORS.social,
    subjectIds: ["social"],
    fields: [
      { fieldId: "soc_shizen", fieldName: "自然環境", subjectId: "social", total: 20, correct: 15, points: 20, units: [
        { unitId: "shizen_kikou", unitName: "気候", total: 10, correct: 8, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "shizen_chikei", unitName: "地形", total: 10, correct: 7, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
      ]},
      { fieldId: "soc_shigen", fieldName: "資源と産業", subjectId: "social", total: 18, correct: 11, points: 25, units: [
        { unitId: "shigen_nougyou", unitName: "農業", total: 9, correct: 6, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 2 },
        { unitId: "shigen_kougyou", unitName: "工業・エネルギー", total: 9, correct: 5, difficulty: 3, lastStudied: "2026-03-26", reviewDue: 3 },
      ]},
      { fieldId: "soc_jinkou", fieldName: "人口・都市", subjectId: "social", total: 15, correct: 8, points: 20, units: [
        { unitId: "jinkou_jinkou", unitName: "人口問題", total: 8, correct: 5, difficulty: 3, lastStudied: "2026-03-26", reviewDue: 2 },
        { unitId: "jinkou_toshi", unitName: "都市構造", total: 7, correct: 3, difficulty: 3, lastStudied: "2026-03-25", reviewDue: 3 },
      ]},
      { fieldId: "soc_chiiki", fieldName: "生活文化", subjectId: "social", total: 16, correct: 9, points: 20, units: [
        { unitId: "chiiki_minzoku", unitName: "民族・宗教", total: 8, correct: 5, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 2 },
        { unitId: "chiiki_chishi", unitName: "地誌", total: 8, correct: 4, difficulty: 3, lastStudied: "2026-03-25", reviewDue: 3 },
      ]},
      { fieldId: "soc_chizu", fieldName: "地図・地域", subjectId: "social", total: 12, correct: 8, points: 15, units: [
        { unitId: "chizu_chizu", unitName: "地図の読み方", total: 12, correct: 8, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
      ]},
    ],
  },
  {
    groupId: "info", label: "情報", maxScore: 100, color: SUBJECT_COLORS.info,
    subjectIds: ["info1"],
    fields: [
      { fieldId: "info_joho", fieldName: "情報社会", subjectId: "info1", total: 15, correct: 13, points: 15, units: [
        { unitId: "joho_shakai", unitName: "情報モラル・法", total: 8, correct: 7, difficulty: 1, lastStudied: "2026-03-28", reviewDue: 0 },
        { unitId: "joho_mondai", unitName: "問題解決", total: 7, correct: 6, difficulty: 2, lastStudied: "2026-03-27", reviewDue: 0 },
      ]},
      { fieldId: "info_comp", fieldName: "プログラミング", subjectId: "info1", total: 22, correct: 14, points: 30, units: [
        { unitId: "comp_algo", unitName: "アルゴリズム", total: 12, correct: 7, difficulty: 4, lastStudied: "2026-03-29", reviewDue: 3 },
        { unitId: "comp_prog", unitName: "プログラム作成", total: 10, correct: 7, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 2 },
      ]},
      { fieldId: "info_network", fieldName: "ネットワーク", subjectId: "info1", total: 12, correct: 7, points: 15, units: [
        { unitId: "net_kiso", unitName: "通信プロトコル", total: 6, correct: 4, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
        { unitId: "net_security", unitName: "セキュリティ", total: 6, correct: 3, difficulty: 3, lastStudied: "2026-03-26", reviewDue: 2 },
      ]},
      { fieldId: "info_comm", fieldName: "情報デザイン", subjectId: "info1", total: 14, correct: 11, points: 20, units: [
        { unitId: "comm_design", unitName: "デザイン原則", total: 14, correct: 11, difficulty: 2, lastStudied: "2026-03-28", reviewDue: 1 },
      ]},
      { fieldId: "info_data", fieldName: "データ活用", subjectId: "info1", total: 16, correct: 12, points: 20, units: [
        { unitId: "data_bunseki", unitName: "データ分析", total: 10, correct: 8, difficulty: 3, lastStudied: "2026-03-28", reviewDue: 1 },
        { unitId: "data_db", unitName: "データベース", total: 6, correct: 4, difficulty: 3, lastStudied: "2026-03-27", reviewDue: 1 },
      ]},
    ],
  },
];

/** ユーティリティ: 正答率 → 色 */
export function rateToColor(rate: number, total: number): string {
  if (total < 3) return "#374151";
  if (rate <= 0.5) {
    const t = rate / 0.5;
    return `rgb(${Math.round(220 - t * 30)},${Math.round(38 + t * 185)},38)`;
  }
  const t = (rate - 0.5) / 0.5;
  return `rgb(${Math.round(190 - t * 156)},${Math.round(223 - t * 26)},${Math.round(38 + t * 59)})`;
}

export function rateToTextColor(rate: number): string {
  return rate > 0.65 ? "#052e16" : "#ffffff";
}
