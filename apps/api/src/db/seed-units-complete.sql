-- ============================================================
-- 全分野・全単元マスタ補完
-- seed.sql で定義されていない単元を網羅的に追加
-- ============================================================

-- ── 国語 ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('kokugo_gendai_hyoron', 'kokugo_gendai', '評論', 1),
  ('kokugo_gendai_shosetsu', 'kokugo_gendai', '小説', 2),
  ('kokugo_gendai_jitsuyou', 'kokugo_gendai', '実用的文章', 3),
  ('kokugo_kobun_bunpou', 'kokugo_kobun', '文法(助動詞)', 1),
  ('kokugo_kobun_dokkai', 'kokugo_kobun', '読解', 2),
  ('kokugo_kobun_goi', 'kokugo_kobun', '古語・語彙', 3),
  ('kokugo_kanbun_kukei', 'kokugo_kanbun', '句形・返り点', 1),
  ('kokugo_kanbun_dokkai', 'kokugo_kanbun', '読解', 2),
  ('kokugo_kanbun_koji', 'kokugo_kanbun', '故事成語', 3);

-- ── 数学IA ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('m1a_suushiki_tenkai', 'm1a_suushiki', '展開・因数分解', 1),
  ('m1a_suushiki_shuugo', 'm1a_suushiki', '集合と論理', 2),
  ('m1a_niji_graph', 'm1a_niji', 'グラフと最大最小', 1),
  ('m1a_niji_houtei', 'm1a_niji', '2次方程式・不等式', 2),
  ('m1a_zukei_sankaku', 'm1a_zukei', '三角比', 1),
  ('m1a_zukei_seigen', 'm1a_zukei', '正弦定理・余弦定理', 2),
  ('m1a_data_daihyo', 'm1a_data', '代表値・分散', 1),
  ('m1a_data_soukan', 'm1a_data', '相関・回帰', 2),
  ('m1a_seishitsu_en', 'm1a_seishitsu', '円の性質', 1),
  ('m1a_seishitsu_kukan', 'm1a_seishitsu', '空間図形', 2);

-- ── 数学IIBC ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('m2bc_shiki_fukusosu', 'm2bc_shiki', '複素数', 1),
  ('m2bc_shiki_shoumei', 'm2bc_shiki', '等式・不等式の証明', 2),
  ('m2bc_kansuu_sankaku', 'm2bc_kansuu', '三角関数', 1),
  ('m2bc_kansuu_shisuu', 'm2bc_kansuu', '指数・対数', 2),
  ('m2bc_bibun_bibun', 'm2bc_bibun', '微分法', 1),
  ('m2bc_bibun_sekibun', 'm2bc_bibun', '積分法', 2),
  ('m2bc_suuretsu_toutou', 'm2bc_suuretsu', '等差・等比数列', 1),
  ('m2bc_suuretsu_zenka', 'm2bc_suuretsu', '漸化式', 2),
  ('m2bc_vector_heimen', 'm2bc_vector', '平面ベクトル', 1),
  ('m2bc_vector_kukan', 'm2bc_vector', '空間ベクトル', 2),
  ('m2bc_toukei_bunpu', 'm2bc_toukei', '確率分布', 1),
  ('m2bc_toukei_suisoku', 'm2bc_toukei', '統計的推測', 2);

-- ── 英語R ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('engr_q1_ad', 'engr_q1', '広告・掲示', 1),
  ('engr_q1_email', 'engr_q1', 'メール・短文', 2),
  ('engr_q2_web', 'engr_q2', 'ウェブサイト', 1),
  ('engr_q2_leaflet', 'engr_q2', 'リーフレット', 2),
  ('engr_q3_blog', 'engr_q3', 'ブログ・記事', 1),
  ('engr_q3_narr', 'engr_q3', '短いナラティブ', 2),
  ('engr_q4_graph', 'engr_q4', '図表読解', 1),
  ('engr_q4_report', 'engr_q4', 'レポート読解', 2),
  ('engr_q5_story', 'engr_q5', '物語読解', 1),
  ('engr_q6_essay', 'engr_q6', '論説読解', 1),
  ('engr_q6_summary', 'engr_q6', '要約・論点整理', 2);

-- ── 英語L ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('engl_q1_short', 'engl_q1', '短い対話', 1),
  ('engl_q2_response', 'engl_q2', '対話の応答', 1),
  ('engl_q3_outline', 'engl_q3', '対話の概要', 1),
  ('engl_q4_mono', 'engl_q4', 'モノローグ', 1),
  ('engl_q5_lecture', 'engl_q5', '講義聴解', 1),
  ('engl_q6_long', 'engl_q6', '長い対話聴解', 1);

-- ── 物理 ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('phys_netsuri_daiichi', 'phys_netsuri', '熱力学第一法則', 1),
  ('phys_netsuri_kitai', 'phys_netsuri', '気体の状態変化', 2),
  ('phys_hadou_nami', 'phys_hadou', '波の性質', 1),
  ('phys_hadou_oto', 'phys_hadou', '音・光', 2),
  ('phys_genshi_kouzou', 'phys_genshi', '原子構造', 1),
  ('phys_genshi_kakuhannou', 'phys_genshi', '核反応', 2);

-- ── 化学 ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('chem_riron_ketsugo', 'chem_riron', '化学結合', 2),
  ('chem_riron_netsuri', 'chem_riron', '熱化学', 4),
  ('chem_riron_heiko', 'chem_riron', '化学平衡', 5),
  ('chem_muki_kinzoku', 'chem_muki', '金属元素', 1),
  ('chem_muki_hikinzoku', 'chem_muki', '非金属元素', 2),
  ('chem_yuuki_shibou', 'chem_yuuki', '脂肪族', 1),
  ('chem_yuuki_houkou', 'chem_yuuki', '芳香族', 2),
  ('chem_yuuki_kouzou', 'chem_yuuki', '構造決定', 3),
  ('chem_koubun_gousei', 'chem_koubun', '合成高分子', 1),
  ('chem_koubun_tennen', 'chem_koubun', '天然高分子', 2);

-- ── 社会 ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('soc_shizen_kikou', 'soc_shizen', '気候', 1),
  ('soc_shizen_chikei', 'soc_shizen', '地形', 2),
  ('soc_shigen_nougyou', 'soc_shigen', '農業', 1),
  ('soc_shigen_kougyou', 'soc_shigen', '工業・エネルギー', 2),
  ('soc_jinkou_jinkou', 'soc_jinkou', '人口問題', 1),
  ('soc_jinkou_toshi', 'soc_jinkou', '都市構造', 2),
  ('soc_chiiki_minzoku', 'soc_chiiki', '民族・宗教', 1),
  ('soc_chiiki_chishi', 'soc_chiiki', '地誌', 2),
  ('soc_chizu_chizu', 'soc_chizu', '地図の読み方', 1),
  ('soc_chizu_gis', 'soc_chizu', 'GIS・地域調査', 2);

-- ── 情報I ──
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('info_joho_moral', 'info_joho', '情報モラル・法', 1),
  ('info_joho_mondai', 'info_joho', '問題解決', 2),
  ('info_comm_design', 'info_comm', 'デザイン原則', 1),
  ('info_comm_media', 'info_comm', 'メディア表現', 2),
  ('info_comp_algo', 'info_comp', 'アルゴリズム', 1),
  ('info_comp_prog', 'info_comp', 'プログラム作成', 2),
  ('info_network_proto', 'info_network', '通信プロトコル', 1),
  ('info_network_security', 'info_network', 'セキュリティ', 2),
  ('info_data_bunseki', 'info_data', 'データ分析', 1),
  ('info_data_db', 'info_data', 'データベース', 2);
