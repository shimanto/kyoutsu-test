-- ============================================================
-- 科目マスタ
-- ============================================================
INSERT OR IGNORE INTO subjects (id, name, max_score, display_order) VALUES
  ('kokugo',     '国語',             200, 1),
  ('math1a',     '数学I・A',          100, 2),
  ('math2bc',    '数学II・B・C',      100, 3),
  ('eng_read',   '英語リーディング',    100, 4),
  ('eng_listen', '英語リスニング',      100, 5),
  ('physics',    '物理',             100, 6),
  ('chemistry',  '化学',             100, 7),
  ('social',     '社会',             100, 8),
  ('info1',      '情報I',            100, 9);

-- ============================================================
-- 分野マスタ (主要分野)
-- ============================================================

-- 国語
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('kokugo_gendai',  'kokugo', '現代文', 1),
  ('kokugo_kobun',   'kokugo', '古文',   2),
  ('kokugo_kanbun',  'kokugo', '漢文',   3);

-- 数学IA
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('m1a_suushiki',   'math1a', '数と式・集合と論理', 1),
  ('m1a_niji',       'math1a', '2次関数',          2),
  ('m1a_zukei',      'math1a', '図形と計量',        3),
  ('m1a_data',       'math1a', 'データの分析',      4),
  ('m1a_jougo',      'math1a', '場合の数と確率',    5),
  ('m1a_seishitsu',  'math1a', '図形の性質',        6);

-- 数学IIBC
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('m2bc_shiki',     'math2bc', '式と証明・複素数',   1),
  ('m2bc_kansuu',    'math2bc', '三角関数・指数対数', 2),
  ('m2bc_bibun',     'math2bc', '微分法・積分法',     3),
  ('m2bc_suuretsu',  'math2bc', '数列',              4),
  ('m2bc_vector',    'math2bc', 'ベクトル',           5),
  ('m2bc_toukei',    'math2bc', '統計的な推測',       6);

-- 英語R
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('engr_q1',  'eng_read', '第1問(短文読解)',    1),
  ('engr_q2',  'eng_read', '第2問(情報検索)',    2),
  ('engr_q3',  'eng_read', '第3問(要旨把握)',    3),
  ('engr_q4',  'eng_read', '第4問(図表・グラフ)', 4),
  ('engr_q5',  'eng_read', '第5問(物語文)',      5),
  ('engr_q6',  'eng_read', '第6問(論説文)',      6);

-- 英語L
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('engl_q1',  'eng_listen', '第1問(短い対話)',    1),
  ('engl_q2',  'eng_listen', '第2問(対話の応答)',  2),
  ('engl_q3',  'eng_listen', '第3問(対話の概要)',  3),
  ('engl_q4',  'eng_listen', '第4問(モノローグ)',  4),
  ('engl_q5',  'eng_listen', '第5問(講義)',       5),
  ('engl_q6',  'eng_listen', '第6問(長い対話)',    6);

-- 物理
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('phys_rikigaku', 'physics', '力学',         1),
  ('phys_netsuri',  'physics', '熱力学',       2),
  ('phys_hadou',    'physics', '波動',         3),
  ('phys_denki',    'physics', '電磁気学',     4),
  ('phys_genshi',   'physics', '原子',         5);

-- 化学
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('chem_riron',  'chemistry', '理論化学', 1),
  ('chem_muki',   'chemistry', '無機化学', 2),
  ('chem_yuuki',  'chemistry', '有機化学', 3),
  ('chem_koubun', 'chemistry', '高分子',   4);

-- 社会 (地理B想定)
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('soc_shizen',  'social', '自然環境',       1),
  ('soc_shigen',  'social', '資源と産業',     2),
  ('soc_jinkou',  'social', '人口・都市・村落', 3),
  ('soc_chiiki',  'social', '生活文化・地誌',  4),
  ('soc_chizu',   'social', '地図と地域調査',  5);

-- 情報I
INSERT OR IGNORE INTO fields (id, subject_id, name, display_order) VALUES
  ('info_joho',    'info1', '情報社会と問題解決',   1),
  ('info_comm',    'info1', 'コミュニケーションと情報デザイン', 2),
  ('info_comp',    'info1', 'コンピュータとプログラミング', 3),
  ('info_network', 'info1', '情報通信ネットワーク',  4),
  ('info_data',    'info1', 'データの活用',         5);

-- ============================================================
-- 単元マスタ (代表的な単元をいくつか)
-- ============================================================

-- 数学IA - 場合の数と確率
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('m1a_jougo_baaisu',  'm1a_jougo', '場合の数',      1),
  ('m1a_jougo_kakuritsu','m1a_jougo', '確率',          2),
  ('m1a_jougo_joukentuki','m1a_jougo','条件付き確率',   3);

-- 物理 - 力学
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('phys_rik_undou',   'phys_rikigaku', '等加速度運動',   1),
  ('phys_rik_chikara', 'phys_rikigaku', '力のつりあい',   2),
  ('phys_rik_energy',  'phys_rikigaku', '力学的エネルギー', 3),
  ('phys_rik_undouryou','phys_rikigaku', '運動量と力積',   4);

-- 化学 - 理論化学
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('chem_riron_genshi',  'chem_riron', '原子の構造',     1),
  ('chem_riron_ketsugo', 'chem_riron', '化学結合',       2),
  ('chem_riron_mol',     'chem_riron', '物質量(mol)',    3),
  ('chem_riron_netsuri',  'chem_riron', '熱化学',        4);
