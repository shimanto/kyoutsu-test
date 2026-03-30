-- ============================================================
-- サンプル問題データ投入 (偏差値60向けコンテンツ)
-- ============================================================

-- 単元がまだ無い分野用に汎用単元を作成
INSERT OR IGNORE INTO units (id, field_id, name, display_order) VALUES
  ('kokugo_gendai_u1', 'kokugo_gendai', '評論', 1),
  ('kokugo_gendai_u2', 'kokugo_gendai', '小説', 2),
  ('kokugo_kobun_u1', 'kokugo_kobun', '文法(助動詞)', 1),
  ('kokugo_kobun_u2', 'kokugo_kobun', '読解', 2),
  ('kokugo_kanbun_u1', 'kokugo_kanbun', '句形・返り点', 1),
  ('kokugo_kanbun_u2', 'kokugo_kanbun', '読解', 2),
  ('m1a_jougo_u1', 'm1a_jougo', '順列・組合せ', 1),
  ('m1a_jougo_u2', 'm1a_jougo', '確率', 2),
  ('m2bc_vector_u1', 'm2bc_vector', '平面ベクトル', 1),
  ('m2bc_vector_u2', 'm2bc_vector', '空間ベクトル', 2),
  ('phys_denki_u1', 'phys_denki', '電場・電位', 1),
  ('phys_denki_u2', 'phys_denki', '直流回路', 2),
  ('chem_yuuki_u1', 'chem_yuuki', '脂肪族', 1),
  ('chem_yuuki_u2', 'chem_yuuki', '芳香族', 2),
  ('engr_q6_u1', 'engr_q6', '論説読解', 1),
  ('engl_q5_u1', 'engl_q5', '講義聴解', 1),
  ('soc_jinkou_u1', 'soc_jinkou', '人口問題', 1),
  ('soc_jinkou_u2', 'soc_jinkou', '都市構造', 2),
  ('info_comp_u1', 'info_comp', 'アルゴリズム', 1),
  ('info_comp_u2', 'info_comp', 'プログラム作成', 2);

-- ── 有機化学 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('cy1', 'chem_yuuki_u2', 'ベンゼンのニトロ化で得られる主生成物はどれか。', 'choice', 2, 3, 'ベンゼンに混酸（濃硝酸＋濃硫酸）を加えて加温すると、ニトロ化反応が起こりニトロベンゼン C₆H₅NO₂ が生成する。', 'original'),
  ('cy2', 'chem_yuuki_u1', 'エタノールを穏やかに酸化すると得られる化合物として正しいものはどれか。', 'choice', 1, 3, '第一級アルコールであるエタノール CH₃CH₂OH を穏やかに酸化するとアセトアルデヒド CH₃CHO が得られる。さらに酸化すると酢酸 CH₃COOH になる。', 'original'),
  ('cy3', 'chem_yuuki_u1', '次のうち、エステル結合を含む化合物はどれか。', 'choice', 2, 3, 'エステル結合は -COO- の構造。酢酸エチル CH₃COOC₂H₅ がエステル。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('cy1a', 'cy1', '1', 'ニトロベンゼン', 1, 1), ('cy1b', 'cy1', '2', 'アニリン', 0, 2),
  ('cy1c', 'cy1', '3', 'フェノール', 0, 3), ('cy1d', 'cy1', '4', '安息香酸', 0, 4),
  ('cy2a', 'cy2', '1', '酢酸', 0, 1), ('cy2b', 'cy2', '2', 'アセトアルデヒド', 1, 2),
  ('cy2c', 'cy2', '3', 'ジエチルエーテル', 0, 3), ('cy2d', 'cy2', '4', 'エチレン', 0, 4),
  ('cy3a', 'cy3', '1', '酢酸エチル', 1, 1), ('cy3b', 'cy3', '2', 'ジエチルエーテル', 0, 2),
  ('cy3c', 'cy3', '3', 'アセトアミド', 0, 3), ('cy3d', 'cy3', '4', 'エタノール', 0, 4);

-- ── 古文 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kb1', 'kokugo_kobun_u1', '「あはれなり」の意味として最も適切なものはどれか。', 'choice', 2, 4, '「あはれ」は平安時代の美意識の中核をなす語。自然や人事にしみじみと感動する気持ちを表す。', 'original'),
  ('kb2', 'kokugo_kobun_u1', '「つれづれなり」の意味として最も適切なものはどれか。', 'choice', 2, 4, '「つれづれなり」は「することもなく手持ちぶさたで退屈なさま」を表す。', 'original'),
  ('kb3', 'kokugo_kobun_u1', '助動詞「む」の意味として適切でないものはどれか。', 'choice', 3, 4, '助動詞「む」は推量・意志・勧誘・仮定・婉曲の意味を持つ。過去の意味はない。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kb1a', 'kb1', '1', 'しみじみと心に感じる', 1, 1), ('kb1b', 'kb1', '2', 'かわいそうである', 0, 2),
  ('kb1c', 'kb1', '3', 'はずかしい', 0, 3), ('kb1d', 'kb1', '4', 'すばらしい', 0, 4),
  ('kb2a', 'kb2', '1', '冷淡である', 0, 1), ('kb2b', 'kb2', '2', 'することがなく退屈だ', 1, 2),
  ('kb2c', 'kb2', '3', 'つらい', 0, 3), ('kb2d', 'kb2', '4', '連続している', 0, 4),
  ('kb3a', 'kb3', '1', '推量', 0, 1), ('kb3b', 'kb3', '2', '意志', 0, 2),
  ('kb3c', 'kb3', '3', '過去', 1, 3), ('kb3d', 'kb3', '4', '仮定', 0, 4);

-- ── 確率 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('mj1', 'm1a_jougo_u2', '赤玉3個、白玉5個の入った袋から同時に2個取り出すとき、2個とも赤玉である確率は？', 'choice', 2, 4, '₃C₂/₈C₂ = 3/28。', 'original'),
  ('mj2', 'm1a_jougo_u2', 'サイコロを2回振るとき、出た目の和が7になる確率は？', 'choice', 2, 4, '和が7: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) の6通り。P = 6/36 = 1/6。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('mj1a', 'mj1', '1', '3/28', 1, 1), ('mj1b', 'mj1', '2', '9/64', 0, 2),
  ('mj1c', 'mj1', '3', '3/8', 0, 3), ('mj1d', 'mj1', '4', '1/7', 0, 4),
  ('mj2a', 'mj2', '1', '1/6', 1, 1), ('mj2b', 'mj2', '2', '1/9', 0, 2),
  ('mj2c', 'mj2', '3', '5/36', 0, 3), ('mj2d', 'mj2', '4', '7/36', 0, 4);

-- ── ベクトル ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('vc1', 'm2bc_vector_u1', 'ベクトル a⃗ = (3, 4) の大きさ |a⃗| を求めよ。', 'choice', 1, 4, '|a⃗| = √(9 + 16) = 5', 'original'),
  ('vc2', 'm2bc_vector_u1', 'a⃗ = (1, 2), b⃗ = (3, -1) のとき、内積 a⃗ · b⃗ の値は？', 'choice', 2, 4, 'a⃗ · b⃗ = 1×3 + 2×(-1) = 1', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('vc1a', 'vc1', '1', '5', 1, 1), ('vc1b', 'vc1', '2', '7', 0, 2),
  ('vc1c', 'vc1', '3', '√7', 0, 3), ('vc1d', 'vc1', '4', '12', 0, 4),
  ('vc2a', 'vc2', '1', '1', 1, 1), ('vc2b', 'vc2', '2', '5', 0, 2),
  ('vc2c', 'vc2', '3', '-1', 0, 3), ('vc2d', 'vc2', '4', '7', 0, 4);

-- ── 電磁気 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('pd1', 'phys_denki_u1', '電気量 2.0×10⁻⁶ C の点電荷から 0.30 m 離れた点の電場の強さは何 N/C か。k = 9.0×10⁹', 'choice', 3, 4, 'E = kQ/r² = 9.0×10⁹ × 2.0×10⁻⁶ / 0.09 = 2.0×10⁵ N/C', 'original'),
  ('pd2', 'phys_denki_u2', 'R₁ = 3Ω と R₂ = 6Ω を並列接続したとき、合成抵抗は？', 'choice', 2, 4, '1/R = 1/3 + 1/6 = 1/2 → R = 2Ω', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('pd1a', 'pd1', '1', '2.0×10⁵ N/C', 1, 1), ('pd1b', 'pd1', '2', '6.0×10⁴ N/C', 0, 2),
  ('pd1c', 'pd1', '3', '2.0×10⁴ N/C', 0, 3), ('pd1d', 'pd1', '4', '1.8×10⁶ N/C', 0, 4),
  ('pd2a', 'pd2', '1', '2 Ω', 1, 1), ('pd2b', 'pd2', '2', '9 Ω', 0, 2),
  ('pd2c', 'pd2', '3', '4.5 Ω', 0, 3), ('pd2d', 'pd2', '4', '1 Ω', 0, 4);

-- ── プログラミング ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('ic1', 'info_comp_u1', 'x = 0\nfor i in range(1, 5):\n    x = x + i\nprint(x)\n\n出力結果は？', 'choice', 2, 4, 'range(1, 5) は 1,2,3,4。x = 0+1+2+3+4 = 10', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('ic1a', 'ic1', '1', '10', 1, 1), ('ic1b', 'ic1', '2', '15', 0, 2),
  ('ic1c', 'ic1', '3', '4', 0, 3), ('ic1d', 'ic1', '4', '5', 0, 4);
