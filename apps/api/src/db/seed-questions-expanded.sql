-- ============================================================
-- 共通テスト対策 問題データベース拡充 (全9科目・全分野カバー)
-- 共通テスト過去問・予想問題形式のオリジナル問題
-- ============================================================

-- ████████████████████████████████████████████████████████████
-- ██ 国語 (200点)                                          ██
-- ████████████████████████████████████████████████████████████

-- ── 現代文・評論 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('gd01', 'kokugo_gendai_hyoron', '次の文章を読んで、筆者が「近代的自我」という概念に対して最も批判的に述べている部分はどれか。\n\n「近代的自我の確立は、個人の自由と権利の獲得という側面では大きな意義を持つ。しかし、それが共同体からの離脱を意味するならば、人間存在の根源的な孤独を引き受けざるを得ない。」', 'choice', 3, 8, '筆者は近代的自我の意義を認めつつも、共同体からの離脱がもたらす「根源的な孤独」を批判的に捉えている。', 'original'),
  ('gd02', 'kokugo_gendai_hyoron', '「科学技術の発展は、人間の生活を豊かにする一方で、自然環境の破壊をもたらした。」この文における筆者の主張の構造として最も適切なものはどれか。', 'choice', 2, 6, '「一方で」という逆接の接続表現により、科学技術のメリットとデメリットを対比する二項対立の構造になっている。', 'original'),
  ('gd03', 'kokugo_gendai_hyoron', '次のうち、「比喩」の用法として最も適切なものはどれか。', 'choice', 2, 4, '比喩には直喩（〜のような）、隠喩（〜は〜だ）、擬人法などがある。「時は金なり」は隠喩の代表例。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('gd01a', 'gd01', '1', '個人の自由と権利の獲得という側面', 0, 1),
  ('gd01b', 'gd01', '2', '共同体からの離脱を意味するならば', 0, 2),
  ('gd01c', 'gd01', '3', '人間存在の根源的な孤独を引き受けざるを得ない', 1, 3),
  ('gd01d', 'gd01', '4', '大きな意義を持つ', 0, 4),
  ('gd02a', 'gd02', '1', '因果関係', 0, 1),
  ('gd02b', 'gd02', '2', '二項対立', 1, 2),
  ('gd02c', 'gd02', '3', '列挙', 0, 3),
  ('gd02d', 'gd02', '4', '具体例の提示', 0, 4),
  ('gd03a', 'gd03', '1', '彼は走るのが速い', 0, 1),
  ('gd03b', 'gd03', '2', '時は金なり', 1, 2),
  ('gd03c', 'gd03', '3', '彼は毎日走っている', 0, 3),
  ('gd03d', 'gd03', '4', '速く走ることは大切だ', 0, 4);

-- ── 現代文・小説 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('gd04', 'kokugo_gendai_shosetsu', '小説において、登場人物の心情を間接的に表現する技法として最も適切なものはどれか。', 'choice', 3, 6, '登場人物の心情を風景や自然の描写を通じて暗示する技法は「情景描写による心情の暗示」と呼ばれる。', 'original'),
  ('gd05', 'kokugo_gendai_shosetsu', '「彼は窓の外に広がる灰色の空を見つめた。」という描写から読み取れる登場人物の心情として最も適切なものはどれか。', 'choice', 2, 6, '灰色の空は暗く沈んだ気分を象徴的に表現する情景描写。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('gd04a', 'gd04', '1', '会話文による直接表現', 0, 1),
  ('gd04b', 'gd04', '2', '情景描写による心情の暗示', 1, 2),
  ('gd04c', 'gd04', '3', '地の文での心情の説明', 0, 3),
  ('gd04d', 'gd04', '4', '登場人物の独白', 0, 4),
  ('gd05a', 'gd05', '1', '明るく楽しい気持ち', 0, 1),
  ('gd05b', 'gd05', '2', '憂鬱で沈んだ気持ち', 1, 2),
  ('gd05c', 'gd05', '3', '怒りの感情', 0, 3),
  ('gd05d', 'gd05', '4', '興奮した気持ち', 0, 4);

-- ── 現代文・実用的文章 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('gd06', 'kokugo_gendai_jitsuyou', '次の契約書の一節について、契約解除が可能な条件はどれか。\n\n「甲は、乙が本契約に定める義務に違反し、甲が書面により催告した後14日以内に是正されない場合、本契約を解除することができる。」', 'choice', 2, 6, '契約解除には①義務違反、②書面での催告、③14日以内の未是正、の3条件すべてが必要。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('gd06a', 'gd06', '1', '乙が義務に違反した場合、直ちに解除できる', 0, 1),
  ('gd06b', 'gd06', '2', '甲の書面催告後14日以内に是正されない場合', 1, 2),
  ('gd06c', 'gd06', '3', '口頭で催告すれば7日後に解除できる', 0, 3),
  ('gd06d', 'gd06', '4', '双方の合意がある場合のみ解除できる', 0, 4);

-- ── 古文・文法 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kb04', 'kokugo_kobun_bunpou', '助動詞「けり」の意味として適切なものはどれか。', 'choice', 2, 4, '「けり」は過去（伝聞過去）と詠嘆の意味を持つ助動詞。', 'original'),
  ('kb05', 'kokugo_kobun_bunpou', '「花ぞ咲きける」の「ぞ〜ける」の用法として正しいものはどれか。', 'choice', 3, 4, '「ぞ」は係助詞で、結びは連体形になる。「ける」は「けり」の連体形。係り結びの法則。', 'original'),
  ('kb06', 'kokugo_kobun_bunpou', '助動詞「ぬ」の活用形のうち、連用形はどれか。', 'choice', 2, 4, '助動詞「ぬ」（完了）の活用：な・に・ぬ・ぬる・ぬれ・ね。連用形は「に」。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kb04a', 'kb04', '1', '過去・詠嘆', 1, 1), ('kb04b', 'kb04', '2', '推量・意志', 0, 2),
  ('kb04c', 'kb04', '3', '完了・存続', 0, 3), ('kb04d', 'kb04', '4', '打消・否定', 0, 4),
  ('kb05a', 'kb05', '1', '強意の係り結び', 0, 1), ('kb05b', 'kb05', '2', '係り結びの法則', 1, 2),
  ('kb05c', 'kb05', '3', '二重否定', 0, 3), ('kb05d', 'kb05', '4', '倒置法', 0, 4),
  ('kb06a', 'kb06', '1', 'な', 0, 1), ('kb06b', 'kb06', '2', 'に', 1, 2),
  ('kb06c', 'kb06', '3', 'ぬ', 0, 3), ('kb06d', 'kb06', '4', 'ね', 0, 4);

-- ── 古文・読解 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kb07', 'kokugo_kobun_dokkai', '「世の中にたえて桜のなかりせば 春の心はのどけからまし」（在原業平）の歌意として最も適切なものはどれか。', 'choice', 3, 6, '反実仮想「〜せば〜まし」の構文。桜がなければ春は穏やかだろうに＝桜があるから気が気でない。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kb07a', 'kb07', '1', '桜がなければ春は退屈だろう', 0, 1),
  ('kb07b', 'kb07', '2', '桜がなければ春はのどかだろうに（桜があるので落ち着かない）', 1, 2),
  ('kb07c', 'kb07', '3', '桜が咲くと心が躍る', 0, 3),
  ('kb07d', 'kb07', '4', '桜は世の中で最も美しい', 0, 4);

-- ── 古文・語彙 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kb08', 'kokugo_kobun_goi', '「をかし」の意味として最も適切なものはどれか。', 'choice', 2, 4, '「をかし」は知的な趣深さ・明るい美しさを表す語。清少納言の美意識を代表する語。', 'original'),
  ('kb09', 'kokugo_kobun_goi', '「いとど」の意味として正しいものはどれか。', 'choice', 2, 4, '「いとど」は「ますます・いっそう」の意味の副詞。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kb08a', 'kb08', '1', '趣深い・興味深い', 1, 1), ('kb08b', 'kb08', '2', '悲しい', 0, 2),
  ('kb08c', 'kb08', '3', 'おかしい・滑稽だ', 0, 3), ('kb08d', 'kb08', '4', '怖い', 0, 4),
  ('kb09a', 'kb09', '1', 'すこし', 0, 1), ('kb09b', 'kb09', '2', 'ますます', 1, 2),
  ('kb09c', 'kb09', '3', 'やっと', 0, 3), ('kb09d', 'kb09', '4', 'そっと', 0, 4);

-- ── 漢文・句形 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kn01', 'kokugo_kanbun_kukei', '「不可不〜」の読みとして正しいものはどれか。', 'choice', 3, 4, '「不可不〜」は「〜ざるべからず」と読み、「〜しなければならない」という二重否定の強い肯定。', 'original'),
  ('kn02', 'kokugo_kanbun_kukei', '「未嘗不〜」の意味として正しいものはどれか。', 'choice', 3, 4, '「未嘗不〜」は「いまだかつて〜ずんばあらず」→「必ず〜する」。二重否定。', 'original'),
  ('kn03', 'kokugo_kanbun_kukei', '返り点「一・二点」の読む順番として正しいものはどれか。\n「人 ²能 ¹弘 道」', 'choice', 2, 4, '一二点は一→二の順で返り読む。「人 能く 道を 弘む」→人は道を広めることができる。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kn01a', 'kn01', '1', '〜すべからず', 0, 1), ('kn01b', 'kn01', '2', '〜ざるべからず(〜しなければならない)', 1, 2),
  ('kn01c', 'kn01', '3', '〜すべし', 0, 3), ('kn01d', 'kn01', '4', '〜できない', 0, 4),
  ('kn02a', 'kn02', '1', '一度も〜しない', 0, 1), ('kn02b', 'kn02', '2', 'まだ〜していない', 0, 2),
  ('kn02c', 'kn02', '3', '必ず〜する', 1, 3), ('kn02d', 'kn02', '4', '〜してはならない', 0, 4),
  ('kn03a', 'kn03', '1', '人→能→弘→道', 0, 1), ('kn03b', 'kn03', '2', '人→弘→能→道', 0, 2),
  ('kn03c', 'kn03', '3', '道→弘→能→人', 0, 3), ('kn03d', 'kn03', '4', '人→能く道を弘む', 1, 4);

-- ── 漢文・読解 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kn04', 'kokugo_kanbun_dokkai', '「温故知新」の出典として正しいものはどれか。', 'choice', 2, 4, '「温故知新」は『論語』為政篇の孔子の言葉。「故きを温ねて新しきを知る」。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kn04a', 'kn04', '1', '論語', 1, 1), ('kn04b', 'kn04', '2', '老子', 0, 2),
  ('kn04c', 'kn04', '3', '孟子', 0, 3), ('kn04d', 'kn04', '4', '荘子', 0, 4);

-- ── 漢文・故事成語 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('kn05', 'kokugo_kanbun_koji', '「矛盾」の故事の出典として正しいものはどれか。', 'choice', 2, 4, '「矛盾」は『韓非子』に出る故事。どんな盾も貫く矛と、どんな矛も防ぐ盾を同時に売る商人の話。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('kn05a', 'kn05', '1', '韓非子', 1, 1), ('kn05b', 'kn05', '2', '史記', 0, 2),
  ('kn05c', 'kn05', '3', '孫子', 0, 3), ('kn05d', 'kn05', '4', '荘子', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 数学I・A (100点)                                      ██
-- ████████████████████████████████████████████████████████████

-- ── 数と式 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('ms01', 'm1a_suushiki_tenkai', '(x+2)(x-3) を展開せよ。', 'choice', 1, 3, '(x+2)(x-3) = x²-3x+2x-6 = x²-x-6', 'original'),
  ('ms02', 'm1a_suushiki_tenkai', 'x²+5x+6 を因数分解せよ。', 'choice', 1, 3, '和が5、積が6の2数は2と3。x²+5x+6 = (x+2)(x+3)', 'original'),
  ('ms03', 'm1a_suushiki_tenkai', '√12 + √27 を簡単にせよ。', 'choice', 1, 3, '√12 = 2√3, √27 = 3√3 → 2√3 + 3√3 = 5√3', 'original'),
  ('ms04', 'm1a_suushiki_shuugo', '全体集合 U = {1,2,3,4,5,6,7,8,9,10}、A = {2,4,6,8,10} のとき、補集合 Ā は？', 'choice', 1, 3, 'Ā = U - A = {1,3,5,7,9}', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('ms01a', 'ms01', '1', 'x²-x-6', 1, 1), ('ms01b', 'ms01', '2', 'x²+x-6', 0, 2),
  ('ms01c', 'ms01', '3', 'x²-x+6', 0, 3), ('ms01d', 'ms01', '4', 'x²-5x-6', 0, 4),
  ('ms02a', 'ms02', '1', '(x+2)(x+3)', 1, 1), ('ms02b', 'ms02', '2', '(x+1)(x+6)', 0, 2),
  ('ms02c', 'ms02', '3', '(x-2)(x-3)', 0, 3), ('ms02d', 'ms02', '4', '(x+2)(x-3)', 0, 4),
  ('ms03a', 'ms03', '1', '5√3', 1, 1), ('ms03b', 'ms03', '2', '√39', 0, 2),
  ('ms03c', 'ms03', '3', '3√5', 0, 3), ('ms03d', 'ms03', '4', '6√3', 0, 4),
  ('ms04a', 'ms04', '1', '{1,3,5,7,9}', 1, 1), ('ms04b', 'ms04', '2', '{1,2,3,4,5}', 0, 2),
  ('ms04c', 'ms04', '3', '{2,4,6,8}', 0, 3), ('ms04d', 'ms04', '4', '{1,3,5,7}', 0, 4);

-- ── 2次関数 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('mn01', 'm1a_niji_graph', 'y = x²-4x+3 の頂点の座標を求めよ。', 'choice', 2, 4, 'y = (x-2)²-1 より頂点は (2, -1)', 'original'),
  ('mn02', 'm1a_niji_graph', 'y = -x²+6x-5 の最大値を求めよ。', 'choice', 2, 4, 'y = -(x-3)²+4 より最大値は4（x=3のとき）', 'original'),
  ('mn03', 'm1a_niji_houtei', 'x²-5x+6 = 0 の解を求めよ。', 'choice', 1, 3, '(x-2)(x-3) = 0 より x = 2, 3', 'original'),
  ('mn04', 'm1a_niji_houtei', '2次不等式 x²-3x-4 > 0 の解は？', 'choice', 2, 4, 'x²-3x-4 = (x-4)(x+1) = 0 の解は x=-1, 4。上に凸でないのでx<-1 または x>4', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('mn01a', 'mn01', '1', '(2, -1)', 1, 1), ('mn01b', 'mn01', '2', '(-2, 1)', 0, 2),
  ('mn01c', 'mn01', '3', '(2, 3)', 0, 3), ('mn01d', 'mn01', '4', '(4, -1)', 0, 4),
  ('mn02a', 'mn02', '1', '4', 1, 1), ('mn02b', 'mn02', '2', '3', 0, 2),
  ('mn02c', 'mn02', '3', '5', 0, 3), ('mn02d', 'mn02', '4', '9', 0, 4),
  ('mn03a', 'mn03', '1', 'x=2, x=3', 1, 1), ('mn03b', 'mn03', '2', 'x=1, x=6', 0, 2),
  ('mn03c', 'mn03', '3', 'x=-2, x=-3', 0, 3), ('mn03d', 'mn03', '4', 'x=2, x=-3', 0, 4),
  ('mn04a', 'mn04', '1', 'x<-1 または x>4', 1, 1), ('mn04b', 'mn04', '2', '-1<x<4', 0, 2),
  ('mn04c', 'mn04', '3', 'x<-4 または x>1', 0, 3), ('mn04d', 'mn04', '4', 'x>4', 0, 4);

-- ── 図形と計量 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('mz01', 'm1a_zukei_sankaku', 'sin30° の値は？', 'choice', 1, 3, 'sin30° = 1/2', 'original'),
  ('mz02', 'm1a_zukei_sankaku', 'cos60° の値は？', 'choice', 1, 3, 'cos60° = 1/2', 'original'),
  ('mz03', 'm1a_zukei_seigen', '△ABCにおいて、a=5, B=60°, C=90°のとき、外接円の半径Rを求めよ。', 'choice', 3, 4, '正弦定理: a/sinA = 2R。A=30°なのでsin30°=1/2。5/(1/2) = 10 → R=5', 'original'),
  ('mz04', 'm1a_zukei_seigen', '△ABCにおいて a=3, b=5, C=60° のとき cの値は？', 'choice', 3, 4, '余弦定理: c² = a²+b²-2ab·cosC = 9+25-30·(1/2) = 19。c=√19', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('mz01a', 'mz01', '1', '1/2', 1, 1), ('mz01b', 'mz01', '2', '√3/2', 0, 2),
  ('mz01c', 'mz01', '3', '1/√2', 0, 3), ('mz01d', 'mz01', '4', '√2/2', 0, 4),
  ('mz02a', 'mz02', '1', '1/2', 1, 1), ('mz02b', 'mz02', '2', '√3/2', 0, 2),
  ('mz02c', 'mz02', '3', '0', 0, 3), ('mz02d', 'mz02', '4', '1', 0, 4),
  ('mz03a', 'mz03', '1', '5', 1, 1), ('mz03b', 'mz03', '2', '10', 0, 2),
  ('mz03c', 'mz03', '3', '5/2', 0, 3), ('mz03d', 'mz03', '4', '5√3', 0, 4),
  ('mz04a', 'mz04', '1', '√19', 1, 1), ('mz04b', 'mz04', '2', '√34', 0, 2),
  ('mz04c', 'mz04', '3', '√14', 0, 3), ('mz04d', 'mz04', '4', '√49', 0, 4);

-- ── データの分析 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('md01', 'm1a_data_daihyo', 'データ {2, 5, 5, 8, 10} の中央値（メディアン）は？', 'choice', 1, 3, '5つのデータを昇順に並べると3番目が中央値。答えは5。', 'original'),
  ('md02', 'm1a_data_daihyo', 'データ {3, 5, 7, 9, 11} の分散を求めよ。', 'choice', 2, 4, '平均=7。偏差の2乗: 16,4,0,4,16。分散=40/5=8', 'original'),
  ('md03', 'm1a_data_soukan', '相関係数rの範囲として正しいものはどれか。', 'choice', 1, 3, '相関係数は -1 ≤ r ≤ 1 の範囲をとる。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('md01a', 'md01', '1', '5', 1, 1), ('md01b', 'md01', '2', '6', 0, 2),
  ('md01c', 'md01', '3', '5.5', 0, 3), ('md01d', 'md01', '4', '8', 0, 4),
  ('md02a', 'md02', '1', '8', 1, 1), ('md02b', 'md02', '2', '4', 0, 2),
  ('md02c', 'md02', '3', '10', 0, 3), ('md02d', 'md02', '4', '2√2', 0, 4),
  ('md03a', 'md03', '1', '-1 ≤ r ≤ 1', 1, 1), ('md03b', 'md03', '2', '0 ≤ r ≤ 1', 0, 2),
  ('md03c', 'md03', '3', '-∞ < r < ∞', 0, 3), ('md03d', 'md03', '4', '0 < r < 1', 0, 4);

-- ── 場合の数・確率 (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('mj03', 'm1a_jougo_u2', '当たりくじ3本を含む10本のくじがある。2本引くとき、少なくとも1本当たる確率は？', 'choice', 3, 4, '余事象: 2本とも外れ = ₇C₂/₁₀C₂ = 21/45 = 7/15。求める確率 = 1-7/15 = 8/15', 'original'),
  ('mj04', 'm1a_jougo_u1', '5人から3人を選ぶ組合せの数は？', 'choice', 1, 3, '₅C₃ = 5!/(3!·2!) = 10', 'original'),
  ('mj05', 'm1a_jougo_u2', 'コインを3回投げるとき、ちょうど2回表が出る確率は？', 'choice', 2, 4, '₃C₂×(1/2)²×(1/2)¹ = 3/8', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('mj03a', 'mj03', '1', '8/15', 1, 1), ('mj03b', 'mj03', '2', '3/10', 0, 2),
  ('mj03c', 'mj03', '3', '7/15', 0, 3), ('mj03d', 'mj03', '4', '1/3', 0, 4),
  ('mj04a', 'mj04', '1', '10', 1, 1), ('mj04b', 'mj04', '2', '60', 0, 2),
  ('mj04c', 'mj04', '3', '20', 0, 3), ('mj04d', 'mj04', '4', '15', 0, 4),
  ('mj05a', 'mj05', '1', '3/8', 1, 1), ('mj05b', 'mj05', '2', '1/4', 0, 2),
  ('mj05c', 'mj05', '3', '1/2', 0, 3), ('mj05d', 'mj05', '4', '1/8', 0, 4);

-- ── 図形の性質 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('mp01', 'm1a_seishitsu_en', '円に内接する四角形ABCDにおいて、∠A = 80°のとき ∠C は？', 'choice', 2, 4, '円に内接する四角形の対角の和は180°。∠C = 180°-80° = 100°', 'original'),
  ('mp02', 'm1a_seishitsu_kukan', '正四面体の辺の数は？', 'choice', 1, 3, '正四面体は4頂点、6辺、4面。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('mp01a', 'mp01', '1', '100°', 1, 1), ('mp01b', 'mp01', '2', '80°', 0, 2),
  ('mp01c', 'mp01', '3', '90°', 0, 3), ('mp01d', 'mp01', '4', '120°', 0, 4),
  ('mp02a', 'mp02', '1', '6', 1, 1), ('mp02b', 'mp02', '2', '4', 0, 2),
  ('mp02c', 'mp02', '3', '8', 0, 3), ('mp02d', 'mp02', '4', '12', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 数学II・B・C (100点)                                  ██
-- ████████████████████████████████████████████████████████████

-- ── 式と証明 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('m2s01', 'm2bc_shiki_fukusosu', '(1+i)² の値は？ (iは虚数単位)', 'choice', 2, 4, '(1+i)² = 1+2i+i² = 1+2i-1 = 2i', 'original'),
  ('m2s02', 'm2bc_shiki_fukusosu', '複素数 z = 3+4i の絶対値 |z| は？', 'choice', 2, 4, '|z| = √(9+16) = √25 = 5', 'original'),
  ('m2s03', 'm2bc_shiki_shoumei', 'a²+b² ≥ 2ab が成り立つことの証明で使う不等式は？', 'choice', 2, 3, '(a-b)² ≥ 0 を展開すると a²-2ab+b² ≥ 0 → a²+b² ≥ 2ab。相加相乗平均の不等式の基礎。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('m2s01a', 'm2s01', '1', '2i', 1, 1), ('m2s01b', 'm2s01', '2', '2', 0, 2),
  ('m2s01c', 'm2s01', '3', '-2', 0, 3), ('m2s01d', 'm2s01', '4', '1+2i', 0, 4),
  ('m2s02a', 'm2s02', '1', '5', 1, 1), ('m2s02b', 'm2s02', '2', '7', 0, 2),
  ('m2s02c', 'm2s02', '3', '√7', 0, 3), ('m2s02d', 'm2s02', '4', '25', 0, 4),
  ('m2s03a', 'm2s03', '1', '(a-b)² ≥ 0', 1, 1), ('m2s03b', 'm2s03', '2', 'a+b ≥ 0', 0, 2),
  ('m2s03c', 'm2s03', '3', '|a| ≥ a', 0, 3), ('m2s03d', 'm2s03', '4', 'a² ≥ 0', 0, 4);

-- ── 三角関数・指数対数 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('m2k01', 'm2bc_kansuu_sankaku', 'sin(π/3) の値は？', 'choice', 1, 3, 'sin(π/3) = sin60° = √3/2', 'original'),
  ('m2k02', 'm2bc_kansuu_sankaku', 'sin²θ + cos²θ の値は？', 'choice', 1, 3, '三角関数の基本公式。常に1。', 'original'),
  ('m2k03', 'm2bc_kansuu_shisuu', 'log₂8 の値は？', 'choice', 1, 3, '2³=8 なので log₂8 = 3', 'original'),
  ('m2k04', 'm2bc_kansuu_shisuu', 'log₁₀100 + log₁₀10 の値は？', 'choice', 2, 4, 'log₁₀100 = 2, log₁₀10 = 1。答えは3。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('m2k01a', 'm2k01', '1', '√3/2', 1, 1), ('m2k01b', 'm2k01', '2', '1/2', 0, 2),
  ('m2k01c', 'm2k01', '3', '1', 0, 3), ('m2k01d', 'm2k01', '4', '√2/2', 0, 4),
  ('m2k02a', 'm2k02', '1', '1', 1, 1), ('m2k02b', 'm2k02', '2', '0', 0, 2),
  ('m2k02c', 'm2k02', '3', '2', 0, 3), ('m2k02d', 'm2k02', '4', 'sinθ+cosθ', 0, 4),
  ('m2k03a', 'm2k03', '1', '3', 1, 1), ('m2k03b', 'm2k03', '2', '4', 0, 2),
  ('m2k03c', 'm2k03', '3', '2', 0, 3), ('m2k03d', 'm2k03', '4', '8', 0, 4),
  ('m2k04a', 'm2k04', '1', '3', 1, 1), ('m2k04b', 'm2k04', '2', '1000', 0, 2),
  ('m2k04c', 'm2k04', '3', '20', 0, 3), ('m2k04d', 'm2k04', '4', '2', 0, 4);

-- ── 微分法・積分法 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('m2b01', 'm2bc_bibun_bibun', 'f(x) = x³-3x の導関数 f''(x) は？', 'choice', 2, 4, 'f''(x) = 3x²-3', 'original'),
  ('m2b02', 'm2bc_bibun_bibun', 'f(x) = x²-4x+1 の極値を持つxの値は？', 'choice', 2, 4, 'f''(x) = 2x-4 = 0 → x = 2', 'original'),
  ('m2b03', 'm2bc_bibun_sekibun', '∫₀¹ 2x dx の値は？', 'choice', 1, 3, '[x²]₀¹ = 1-0 = 1', 'original'),
  ('m2b04', 'm2bc_bibun_sekibun', '∫₀² (3x²+1) dx の値は？', 'choice', 2, 4, '[x³+x]₀² = (8+2)-(0) = 10', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('m2b01a', 'm2b01', '1', '3x²-3', 1, 1), ('m2b01b', 'm2b01', '2', '3x²+3', 0, 2),
  ('m2b01c', 'm2b01', '3', 'x²-3', 0, 3), ('m2b01d', 'm2b01', '4', '3x-3', 0, 4),
  ('m2b02a', 'm2b02', '1', 'x=2', 1, 1), ('m2b02b', 'm2b02', '2', 'x=4', 0, 2),
  ('m2b02c', 'm2b02', '3', 'x=-2', 0, 3), ('m2b02d', 'm2b02', '4', 'x=1', 0, 4),
  ('m2b03a', 'm2b03', '1', '1', 1, 1), ('m2b03b', 'm2b03', '2', '2', 0, 2),
  ('m2b03c', 'm2b03', '3', '1/2', 0, 3), ('m2b03d', 'm2b03', '4', '4', 0, 4),
  ('m2b04a', 'm2b04', '1', '10', 1, 1), ('m2b04b', 'm2b04', '2', '12', 0, 2),
  ('m2b04c', 'm2b04', '3', '8', 0, 3), ('m2b04d', 'm2b04', '4', '14', 0, 4);

-- ── 数列 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('m2r01', 'm2bc_suuretsu_toutou', '初項3、公差4の等差数列の第10項は？', 'choice', 1, 3, 'aₙ = a₁ + (n-1)d = 3 + 9×4 = 39', 'original'),
  ('m2r02', 'm2bc_suuretsu_toutou', '初項2、公比3の等比数列の第5項は？', 'choice', 2, 4, 'aₙ = a₁·r^(n-1) = 2·3⁴ = 2·81 = 162', 'original'),
  ('m2r03', 'm2bc_suuretsu_zenka', 'aₙ₊₁ = 2aₙ + 1, a₁ = 1 のとき、a₃ の値は？', 'choice', 2, 4, 'a₂ = 2·1+1=3, a₃ = 2·3+1=7', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('m2r01a', 'm2r01', '1', '39', 1, 1), ('m2r01b', 'm2r01', '2', '43', 0, 2),
  ('m2r01c', 'm2r01', '3', '40', 0, 3), ('m2r01d', 'm2r01', '4', '36', 0, 4),
  ('m2r02a', 'm2r02', '1', '162', 1, 1), ('m2r02b', 'm2r02', '2', '54', 0, 2),
  ('m2r02c', 'm2r02', '3', '486', 0, 3), ('m2r02d', 'm2r02', '4', '243', 0, 4),
  ('m2r03a', 'm2r03', '1', '7', 1, 1), ('m2r03b', 'm2r03', '2', '5', 0, 2),
  ('m2r03c', 'm2r03', '3', '9', 0, 3), ('m2r03d', 'm2r03', '4', '11', 0, 4);

-- ── ベクトル (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('vc03', 'm2bc_vector_u1', 'a⃗ = (2,1), b⃗ = (-1,3) のとき 2a⃗ + b⃗ は？', 'choice', 2, 4, '2(2,1)+(-1,3) = (4,2)+(-1,3) = (3,5)', 'original'),
  ('vc04', 'm2bc_vector_u2', '空間ベクトル a⃗=(1,0,2), b⃗=(0,1,-1) の内積は？', 'choice', 2, 4, 'a⃗·b⃗ = 0+0-2 = -2', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('vc03a', 'vc03', '1', '(3,5)', 1, 1), ('vc03b', 'vc03', '2', '(3,4)', 0, 2),
  ('vc03c', 'vc03', '3', '(5,3)', 0, 3), ('vc03d', 'vc03', '4', '(1,5)', 0, 4),
  ('vc04a', 'vc04', '1', '-2', 1, 1), ('vc04b', 'vc04', '2', '3', 0, 2),
  ('vc04c', 'vc04', '3', '0', 0, 3), ('vc04d', 'vc04', '4', '1', 0, 4);

-- ── 統計的推測 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('m2t01', 'm2bc_toukei_bunpu', '確率変数Xの期待値E(X)が3、分散V(X)が4のとき、E(2X+1)の値は？', 'choice', 2, 4, 'E(2X+1) = 2E(X)+1 = 2·3+1 = 7', 'original'),
  ('m2t02', 'm2bc_toukei_suisoku', '母集団の標準偏差がσ、標本の大きさnのとき、標本平均の標準偏差は？', 'choice', 3, 4, '標本平均の標準偏差 = σ/√n', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('m2t01a', 'm2t01', '1', '7', 1, 1), ('m2t01b', 'm2t01', '2', '6', 0, 2),
  ('m2t01c', 'm2t01', '3', '9', 0, 3), ('m2t01d', 'm2t01', '4', '8', 0, 4),
  ('m2t02a', 'm2t02', '1', 'σ/√n', 1, 1), ('m2t02b', 'm2t02', '2', 'σ/n', 0, 2),
  ('m2t02c', 'm2t02', '3', 'σ·√n', 0, 3), ('m2t02d', 'm2t02', '4', 'σ²/n', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 英語リーディング (100点)                               ██
-- ████████████████████████████████████████████████████████████

-- ── R第1問 短文読解 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('er01', 'engr_q1_ad', 'The following notice is posted at a library:\n"Due to renovations, the second floor reading room will be closed from March 1 to March 15. All reserved books can be picked up at the first floor counter."\n\nWhat can library users do during the renovation?', 'choice', 1, 3, '掲示文から、予約本は1階カウンターで受け取れることが読み取れる。', 'original'),
  ('er02', 'engr_q1_email', 'From: manager@store.com\nSubject: Schedule Change\n\n"Please note that the store will open one hour later than usual this Saturday due to staff training. Normal hours will resume on Sunday."\n\nWhat is the change this Saturday?', 'choice', 1, 3, 'メールから、土曜日は通常より1時間遅い開店になることが分かる。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('er01a', 'er01', '1', 'Pick up reserved books at the first floor', 1, 1),
  ('er01b', 'er01', '2', 'Use the second floor reading room', 0, 2),
  ('er01c', 'er01', '3', 'Return books at the second floor', 0, 3),
  ('er01d', 'er01', '4', 'Reserve new books online only', 0, 4),
  ('er02a', 'er02', '1', 'The store will open one hour later', 1, 1),
  ('er02b', 'er02', '2', 'The store will be closed all day', 0, 2),
  ('er02c', 'er02', '3', 'The store will close one hour earlier', 0, 3),
  ('er02d', 'er02', '4', 'Staff training is cancelled', 0, 4);

-- ── R第2問 情報検索 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('er03', 'engr_q2_web', 'A website shows the following event information:\n"Summer Festival: Aug 10-12, 10AM-8PM\nAdmission: Adults ¥500, Students ¥300, Under 6 free\nFood stalls close at 7PM"\n\nA family of two adults and one 5-year-old child wants to attend. How much will admission cost?', 'choice', 2, 4, '大人2人×500円=1000円、5歳児は6歳未満で無料。合計1000円。', 'original'),
  ('er04', 'engr_q2_leaflet', 'A gym leaflet states:\n"Monthly membership: ¥8,000\nAnnual membership: ¥80,000 (save ¥16,000!)\nTrial period: First week free for new members"\n\nHow much would a person save per month by choosing the annual plan?', 'choice', 2, 4, '月額12ヶ月=96,000円、年額=80,000円。差額16,000÷12≒1,333円/月の節約。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('er03a', 'er03', '1', '¥1,000', 1, 1), ('er03b', 'er03', '2', '¥1,300', 0, 2),
  ('er03c', 'er03', '3', '¥1,500', 0, 3), ('er03d', 'er03', '4', '¥800', 0, 4),
  ('er04a', 'er04', '1', 'About ¥1,333', 1, 1), ('er04b', 'er04', '2', '¥2,000', 0, 2),
  ('er04c', 'er04', '3', '¥16,000', 0, 3), ('er04d', 'er04', '4', '¥1,000', 0, 4);

-- ── R第3問 要旨把握 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('er05', 'engr_q3_blog', 'A blog post reads:\n"I tried growing tomatoes on my balcony this year. Despite some initial failures with overwatering, I eventually harvested enough to make pasta sauce for the whole family."\n\nWhat is the main message of this blog post?', 'choice', 2, 4, 'ブログの主旨は、失敗を乗り越えてバルコニー菜園で成功したという体験談。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('er05a', 'er05', '1', 'Balcony gardening can be rewarding despite challenges', 1, 1),
  ('er05b', 'er05', '2', 'Tomatoes should never be grown on balconies', 0, 2),
  ('er05c', 'er05', '3', 'Overwatering always ruins tomato plants', 0, 3),
  ('er05d', 'er05', '4', 'Making pasta sauce is difficult', 0, 4);

-- ── R第4問 図表 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('er06', 'engr_q4_graph', 'According to a survey, 60% of students prefer online classes, 25% prefer in-person classes, and 15% have no preference. Which statement is correct?', 'choice', 2, 4, '60%がオンライン授業を好むので、過半数がオンラインを好むことが正しい。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('er06a', 'er06', '1', 'More than half of students prefer online classes', 1, 1),
  ('er06b', 'er06', '2', 'Most students prefer in-person classes', 0, 2),
  ('er06c', 'er06', '3', 'Students are equally split between online and in-person', 0, 3),
  ('er06d', 'er06', '4', 'Most students have no preference', 0, 4);

-- ── R第5問 物語文 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('er07', 'engr_q5_story', '"Sarah had always been afraid of public speaking. When her teacher asked her to give a speech at the school assembly, she wanted to refuse. But her best friend Emma encouraged her, and after weeks of practice, Sarah stood on the stage and delivered her speech without a single mistake."\n\nWhat helped Sarah overcome her fear?', 'choice', 3, 5, 'エマの励ましと練習の積み重ねが、サラの恐怖を克服する助けになった。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('er07a', 'er07', '1', 'Her friend''s encouragement and practice', 1, 1),
  ('er07b', 'er07', '2', 'Her teacher''s strict orders', 0, 2),
  ('er07c', 'er07', '3', 'Reading a book about public speaking', 0, 3),
  ('er07d', 'er07', '4', 'Watching videos of famous speeches', 0, 4);

-- ── R第6問 論説文 (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('er08', 'engr_q6_u1', '"The concept of sustainability requires us to consider not only our current needs but also the needs of future generations. This intergenerational perspective challenges the short-term thinking that dominates much of modern economic policy."\n\nWhat does the author criticize?', 'choice', 4, 6, '筆者は現代の経済政策の短期的思考を批判し、世代間の視点の重要性を主張している。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('er08a', 'er08', '1', 'Short-term thinking in economic policy', 1, 1),
  ('er08b', 'er08', '2', 'The concept of sustainability itself', 0, 2),
  ('er08c', 'er08', '3', 'Future generations'' needs', 0, 3),
  ('er08d', 'er08', '4', 'Long-term economic planning', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 英語リスニング (100点)                                 ██
-- ████████████████████████████████████████████████████████████

INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('el01', 'engl_q1_short', '対話文: Man: "Excuse me, where is the nearest station?" Woman: "Go straight and turn left at the second corner."\n\n男性が尋ねているのは何か。', 'choice', 1, 3, '男性は最寄り駅の場所を尋ねている。', 'original'),
  ('el02', 'engl_q2_response', '質問: "Would you like coffee or tea?"\n適切な応答はどれか。', 'choice', 1, 3, '飲み物の選択を求められているので、具体的に選ぶのが適切。', 'original'),
  ('el03', 'engl_q3_outline', '対話の概要: Two students discuss their plans for summer vacation. One wants to travel abroad, the other prefers staying home to study.\n\n二人の意見の違いは何か。', 'choice', 2, 4, '一人は海外旅行、もう一人は自宅で勉強を希望。夏休みの過ごし方で意見が分かれている。', 'original'),
  ('el04', 'engl_q4_mono', 'アナウンス: "Attention passengers. The 3:15 express train to Tokyo has been delayed by approximately 20 minutes due to signal problems."\n\n列車は何時頃に到着する見込みか。', 'choice', 2, 4, '3:15発が20分遅延→3:35頃の出発見込み。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('el01a', 'el01', '1', '最寄り駅の場所', 1, 1), ('el01b', 'el01', '2', '最寄りのコンビニ', 0, 2),
  ('el01c', 'el01', '3', 'バス停の場所', 0, 3), ('el01d', 'el01', '4', '道の名前', 0, 4),
  ('el02a', 'el02', '1', 'Coffee, please.', 1, 1), ('el02b', 'el02', '2', 'Yes, I do.', 0, 2),
  ('el02c', 'el02', '3', 'No, thank you. I already ate.', 0, 3), ('el02d', 'el02', '4', 'I like both.', 0, 4),
  ('el03a', 'el03', '1', '夏休みの過ごし方', 1, 1), ('el03b', 'el03', '2', '試験の勉強方法', 0, 2),
  ('el03c', 'el03', '3', '旅行先の選択', 0, 3), ('el03d', 'el03', '4', 'アルバイトの選択', 0, 4),
  ('el04a', 'el04', '1', '3:35頃', 1, 1), ('el04b', 'el04', '2', '2:55頃', 0, 2),
  ('el04c', 'el04', '3', '4:15頃', 0, 3), ('el04d', 'el04', '4', '3:15ちょうど', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 物理 (100点)                                          ██
-- ████████████████████████████████████████████████████████████

-- ── 力学 (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('pr01', 'phys_rik_undou', '初速度0、加速度2.0 m/s²で等加速度直線運動する物体が4.0秒後の速度は？', 'choice', 1, 3, 'v = v₀ + at = 0 + 2.0×4.0 = 8.0 m/s', 'original'),
  ('pr02', 'phys_rik_undou', '自由落下する物体が2.0秒間に落下する距離は？(g=9.8 m/s²)', 'choice', 2, 4, 'h = ½gt² = ½×9.8×4 = 19.6 m', 'original'),
  ('pr03', 'phys_rik_chikara', '質量2.0kgの物体に5.0Nの力を加えたときの加速度は？', 'choice', 1, 3, 'F=ma → a=F/m = 5.0/2.0 = 2.5 m/s²', 'original'),
  ('pr04', 'phys_rik_energy', '質量3.0kgの物体が4.0m/sで運動しているとき、運動エネルギーは？', 'choice', 2, 4, 'K = ½mv² = ½×3.0×16 = 24 J', 'original'),
  ('pr05', 'phys_rik_undouryou', '質量2kgの物体が3m/sで運動中。運動量の大きさは？', 'choice', 1, 3, 'p = mv = 2×3 = 6 kg·m/s', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('pr01a', 'pr01', '1', '8.0 m/s', 1, 1), ('pr01b', 'pr01', '2', '4.0 m/s', 0, 2),
  ('pr01c', 'pr01', '3', '6.0 m/s', 0, 3), ('pr01d', 'pr01', '4', '2.0 m/s', 0, 4),
  ('pr02a', 'pr02', '1', '19.6 m', 1, 1), ('pr02b', 'pr02', '2', '9.8 m', 0, 2),
  ('pr02c', 'pr02', '3', '39.2 m', 0, 3), ('pr02d', 'pr02', '4', '4.9 m', 0, 4),
  ('pr03a', 'pr03', '1', '2.5 m/s²', 1, 1), ('pr03b', 'pr03', '2', '10 m/s²', 0, 2),
  ('pr03c', 'pr03', '3', '0.4 m/s²', 0, 3), ('pr03d', 'pr03', '4', '7.0 m/s²', 0, 4),
  ('pr04a', 'pr04', '1', '24 J', 1, 1), ('pr04b', 'pr04', '2', '12 J', 0, 2),
  ('pr04c', 'pr04', '3', '48 J', 0, 3), ('pr04d', 'pr04', '4', '6 J', 0, 4),
  ('pr05a', 'pr05', '1', '6 kg·m/s', 1, 1), ('pr05b', 'pr05', '2', '5 kg·m/s', 0, 2),
  ('pr05c', 'pr05', '3', '1.5 kg·m/s', 0, 3), ('pr05d', 'pr05', '4', '9 kg·m/s', 0, 4);

-- ── 熱力学 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('pt01', 'phys_netsuri_daiichi', '気体に100Jの熱を加え、気体が40Jの仕事をしたとき、内部エネルギーの変化は？', 'choice', 2, 4, '熱力学第一法則: ΔU = Q - W = 100 - 40 = 60 J', 'original'),
  ('pt02', 'phys_netsuri_kitai', '理想気体の状態方程式PV=nRTにおいて、温度を2倍にし体積を一定に保つと圧力は？', 'choice', 2, 4, 'V一定のとき P ∝ T。温度2倍→圧力2倍。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('pt01a', 'pt01', '1', '60 J増加', 1, 1), ('pt01b', 'pt01', '2', '140 J増加', 0, 2),
  ('pt01c', 'pt01', '3', '40 J減少', 0, 3), ('pt01d', 'pt01', '4', '100 J増加', 0, 4),
  ('pt02a', 'pt02', '1', '2倍になる', 1, 1), ('pt02b', 'pt02', '2', '変わらない', 0, 2),
  ('pt02c', 'pt02', '3', '1/2倍になる', 0, 3), ('pt02d', 'pt02', '4', '4倍になる', 0, 4);

-- ── 波動 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('pw01', 'phys_hadou_nami', '波長4.0m、振動数5.0Hzの波の速さは？', 'choice', 1, 3, 'v = fλ = 5.0×4.0 = 20 m/s', 'original'),
  ('pw02', 'phys_hadou_oto', '空気中の音速が340m/sのとき、振動数680Hzの音の波長は？', 'choice', 2, 4, 'λ = v/f = 340/680 = 0.50 m', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('pw01a', 'pw01', '1', '20 m/s', 1, 1), ('pw01b', 'pw01', '2', '1.25 m/s', 0, 2),
  ('pw01c', 'pw01', '3', '9.0 m/s', 0, 3), ('pw01d', 'pw01', '4', '0.8 m/s', 0, 4),
  ('pw02a', 'pw02', '1', '0.50 m', 1, 1), ('pw02b', 'pw02', '2', '2.0 m', 0, 2),
  ('pw02c', 'pw02', '3', '1.0 m', 0, 3), ('pw02d', 'pw02', '4', '0.25 m', 0, 4);

-- ── 原子 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('pa01', 'phys_genshi_kouzou', '光電効果において、入射光の振動数を大きくすると飛び出す電子の最大運動エネルギーはどうなるか。', 'choice', 3, 4, '光電効果の式: K_max = hf - W。振動数fが大きいほど最大運動エネルギーは大きくなる。', 'original'),
  ('pa02', 'phys_genshi_kakuhannou', 'α崩壊で原子番号と質量数はそれぞれいくつ変化するか。', 'choice', 2, 4, 'α粒子(He-4)を放出: 原子番号-2、質量数-4。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('pa01a', 'pa01', '1', '大きくなる', 1, 1), ('pa01b', 'pa01', '2', '小さくなる', 0, 2),
  ('pa01c', 'pa01', '3', '変わらない', 0, 3), ('pa01d', 'pa01', '4', 'ゼロになる', 0, 4),
  ('pa02a', 'pa02', '1', '原子番号-2、質量数-4', 1, 1), ('pa02b', 'pa02', '2', '原子番号-1、質量数-1', 0, 2),
  ('pa02c', 'pa02', '3', '原子番号+2、質量数+4', 0, 3), ('pa02d', 'pa02', '4', '原子番号-1、質量数-4', 0, 4);

-- ── 電磁気 (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('pd03', 'phys_denki_u1', '平行板コンデンサの電気容量Cの公式で正しいものは？(εは誘電率、Sは面積、dは距離)', 'choice', 3, 4, 'C = εS/d', 'original'),
  ('pd04', 'phys_denki_u2', 'オームの法則V=IRにおいて、R=6Ω、I=2AのときVは？', 'choice', 1, 3, 'V = IR = 2×6 = 12 V', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('pd03a', 'pd03', '1', 'C = εS/d', 1, 1), ('pd03b', 'pd03', '2', 'C = εd/S', 0, 2),
  ('pd03c', 'pd03', '3', 'C = S/(εd)', 0, 3), ('pd03d', 'pd03', '4', 'C = εSd', 0, 4),
  ('pd04a', 'pd04', '1', '12 V', 1, 1), ('pd04b', 'pd04', '2', '3 V', 0, 2),
  ('pd04c', 'pd04', '3', '8 V', 0, 3), ('pd04d', 'pd04', '4', '4 V', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 化学 (100点)                                          ██
-- ████████████████████████████████████████████████████████████

-- ── 理論化学 (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('cr01', 'chem_riron_genshi', '原子番号11のナトリウム(Na)の電子配置として正しいものはどれか。', 'choice', 1, 3, 'Na(11): K殻2個、L殻8個、M殻1個 → 2,8,1', 'original'),
  ('cr02', 'chem_riron_ketsugo', '共有結合の例として正しいものはどれか。', 'choice', 2, 3, 'H₂Oは水素と酸素の共有結合。NaClはイオン結合。', 'original'),
  ('cr03', 'chem_riron_mol', '水(H₂O)の分子量は18である。水18gは何molか。', 'choice', 1, 3, '18g ÷ 18g/mol = 1 mol', 'original'),
  ('cr04', 'chem_riron_netsuri', '次の反応は発熱反応か吸熱反応か。\nC + O₂ → CO₂ + 394 kJ', 'choice', 1, 3, '反応式の右辺にエネルギーが出ているので発熱反応。', 'original'),
  ('cr05', 'chem_riron_heiko', 'ルシャトリエの原理によると、平衡状態にある系の温度を上げると平衡はどちらに移動するか。', 'choice', 3, 4, '温度を上げると吸熱方向に平衡が移動する（ルシャトリエの原理）。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('cr01a', 'cr01', '1', '2, 8, 1', 1, 1), ('cr01b', 'cr01', '2', '2, 8, 2', 0, 2),
  ('cr01c', 'cr01', '3', '2, 7, 2', 0, 3), ('cr01d', 'cr01', '4', '2, 9, 0', 0, 4),
  ('cr02a', 'cr02', '1', 'H₂O', 1, 1), ('cr02b', 'cr02', '2', 'NaCl', 0, 2),
  ('cr02c', 'cr02', '3', 'Fe', 0, 3), ('cr02d', 'cr02', '4', 'CaO', 0, 4),
  ('cr03a', 'cr03', '1', '1 mol', 1, 1), ('cr03b', 'cr03', '2', '18 mol', 0, 2),
  ('cr03c', 'cr03', '3', '0.5 mol', 0, 3), ('cr03d', 'cr03', '4', '2 mol', 0, 4),
  ('cr04a', 'cr04', '1', '発熱反応', 1, 1), ('cr04b', 'cr04', '2', '吸熱反応', 0, 2),
  ('cr04c', 'cr04', '3', '中和反応', 0, 3), ('cr04d', 'cr04', '4', '酸化還元反応', 0, 4),
  ('cr05a', 'cr05', '1', '吸熱方向に移動する', 1, 1), ('cr05b', 'cr05', '2', '発熱方向に移動する', 0, 2),
  ('cr05c', 'cr05', '3', '移動しない', 0, 3), ('cr05d', 'cr05', '4', '反応が停止する', 0, 4);

-- ── 無機化学 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('cm01', 'chem_muki_kinzoku', 'アルミニウムは両性金属である。酸にも塩基にも溶ける金属として正しいものはどれか。', 'choice', 2, 3, 'Al, Zn, Sn, Pbが両性金属の代表例。', 'original'),
  ('cm02', 'chem_muki_hikinzoku', 'ハロゲンの反応性が最も高いものはどれか。', 'choice', 2, 3, '周期表で上にあるほど反応性が高い。F > Cl > Br > I', 'original'),
  ('cm03', 'chem_muki_kinzoku', '炎色反応でナトリウムは何色を示すか。', 'choice', 1, 3, 'Na: 黄色、Li: 赤色、K: 紫色、Cu: 緑色', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('cm01a', 'cm01', '1', 'Al, Zn', 1, 1), ('cm01b', 'cm01', '2', 'Fe, Cu', 0, 2),
  ('cm01c', 'cm01', '3', 'Na, K', 0, 3), ('cm01d', 'cm01', '4', 'Ag, Au', 0, 4),
  ('cm02a', 'cm02', '1', 'フッ素(F)', 1, 1), ('cm02b', 'cm02', '2', '塩素(Cl)', 0, 2),
  ('cm02c', 'cm02', '3', '臭素(Br)', 0, 3), ('cm02d', 'cm02', '4', 'ヨウ素(I)', 0, 4),
  ('cm03a', 'cm03', '1', '黄色', 1, 1), ('cm03b', 'cm03', '2', '赤色', 0, 2),
  ('cm03c', 'cm03', '3', '紫色', 0, 3), ('cm03d', 'cm03', '4', '緑色', 0, 4);

-- ── 有機化学 (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('cy04', 'chem_yuuki_shibou', 'メタン(CH₄)の分子構造として正しいものはどれか。', 'choice', 1, 3, 'メタンは正四面体構造。結合角は約109.5°。', 'original'),
  ('cy05', 'chem_yuuki_kouzou', '分子式C₄H₁₀の構造異性体の数は？', 'choice', 2, 4, 'ブタン(n-ブタン)とイソブタン(2-メチルプロパン)の2種類。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('cy04a', 'cy04', '1', '正四面体形', 1, 1), ('cy04b', 'cy04', '2', '正方形', 0, 2),
  ('cy04c', 'cy04', '3', '直線形', 0, 3), ('cy04d', 'cy04', '4', '三角錐形', 0, 4),
  ('cy05a', 'cy05', '1', '2', 1, 1), ('cy05b', 'cy05', '2', '3', 0, 2),
  ('cy05c', 'cy05', '3', '1', 0, 3), ('cy05d', 'cy05', '4', '4', 0, 4);

-- ── 高分子 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('ck01', 'chem_koubun_gousei', 'ポリエチレンの単量体（モノマー）は何か。', 'choice', 1, 3, 'ポリエチレンはエチレン(CH₂=CH₂)の付加重合で得られる。', 'original'),
  ('ck02', 'chem_koubun_tennen', 'デンプンとセルロースに共通する構成単糖は何か。', 'choice', 2, 3, 'どちらもグルコース(ブドウ糖)がグリコシド結合で重合した多糖類。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('ck01a', 'ck01', '1', 'エチレン', 1, 1), ('ck01b', 'ck01', '2', 'プロピレン', 0, 2),
  ('ck01c', 'ck01', '3', 'スチレン', 0, 3), ('ck01d', 'ck01', '4', 'アセチレン', 0, 4),
  ('ck02a', 'ck02', '1', 'グルコース', 1, 1), ('ck02b', 'ck02', '2', 'フルクトース', 0, 2),
  ('ck02c', 'ck02', '3', 'ガラクトース', 0, 3), ('ck02d', 'ck02', '4', 'マンノース', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 社会(地理B) (100点)                                   ██
-- ████████████████████████████████████████████████████████████

-- ── 自然環境 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('sg01', 'soc_shizen_kikou', 'ケッペンの気候区分で「Cfa」に該当する気候はどれか。', 'choice', 2, 4, 'Cfa = 温暖湿潤気候。Cは温帯、fは乾燥限界なし、aは最暖月平均22℃以上。日本の多くの地域が該当。', 'original'),
  ('sg02', 'soc_shizen_kikou', '偏西風が吹く緯度帯はおよそどこか。', 'choice', 2, 4, '偏西風は中緯度(30°~60°)で西から東に吹く恒常風。', 'original'),
  ('sg03', 'soc_shizen_chikei', 'リアス海岸の形成原因として正しいものはどれか。', 'choice', 2, 4, 'リアス海岸は、山地が沈降（海面上昇）して谷に海水が浸入してできた複雑な海岸線。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('sg01a', 'sg01', '1', '温暖湿潤気候', 1, 1), ('sg01b', 'sg01', '2', '地中海性気候', 0, 2),
  ('sg01c', 'sg01', '3', '西岸海洋性気候', 0, 3), ('sg01d', 'sg01', '4', '亜寒帯気候', 0, 4),
  ('sg02a', 'sg02', '1', '中緯度(30°~60°)', 1, 1), ('sg02b', 'sg02', '2', '赤道付近(0°~10°)', 0, 2),
  ('sg02c', 'sg02', '3', '極地(80°~90°)', 0, 3), ('sg02d', 'sg02', '4', '低緯度(10°~30°)', 0, 4),
  ('sg03a', 'sg03', '1', '山地の沈降で谷に海水が浸入', 1, 1), ('sg03b', 'sg03', '2', '河川の堆積作用', 0, 2),
  ('sg03c', 'sg03', '3', '火山活動', 0, 3), ('sg03d', 'sg03', '4', '氷河の侵食', 0, 4);

-- ── 資源と産業 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('sr01', 'soc_shigen_nougyou', '「緑の革命」とは何を指すか。', 'choice', 2, 4, '1960年代以降、高収量品種・灌漑・化学肥料により発展途上国の穀物生産量を飛躍的に増加させた農業革新。', 'original'),
  ('sr02', 'soc_shigen_kougyou', '世界の原油生産量が最も多い国は(2020年代時点)？', 'choice', 2, 4, 'アメリカ合衆国がシェール革命により世界最大の産油国。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('sr01a', 'sr01', '1', '高収量品種等による農業生産性の飛躍的向上', 1, 1),
  ('sr01b', 'sr01', '2', '有機農業への転換運動', 0, 2),
  ('sr01c', 'sr01', '3', '森林伐採による農地拡大', 0, 3),
  ('sr01d', 'sr01', '4', '遺伝子組み換え作物の普及', 0, 4),
  ('sr02a', 'sr02', '1', 'アメリカ合衆国', 1, 1), ('sr02b', 'sr02', '2', 'サウジアラビア', 0, 2),
  ('sr02c', 'sr02', '3', 'ロシア', 0, 3), ('sr02d', 'sr02', '4', '中国', 0, 4);

-- ── 人口・都市 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('sj01', 'soc_jinkou_jinkou', '人口ピラミッドが「つぼ型」の国の特徴として正しいものはどれか。', 'choice', 2, 4, 'つぼ型は少子高齢化が進行した先進国に多い。出生率低下で底辺(若年層)が狭い。', 'original'),
  ('sj02', 'soc_jinkou_toshi', 'プライメートシティ(首位都市)の特徴として正しいものはどれか。', 'choice', 3, 4, 'プライメートシティは国内第2位の都市に比べ圧倒的に人口が多い首位都市。バンコク、マニラ等。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('sj01a', 'sj01', '1', '少子高齢化が進んだ先進国', 1, 1),
  ('sj01b', 'sj01', '2', '人口爆発が起きている途上国', 0, 2),
  ('sj01c', 'sj01', '3', '出生率が高い農村部', 0, 3),
  ('sj01d', 'sj01', '4', '移民が多い国', 0, 4),
  ('sj02a', 'sj02', '1', '第2位の都市に比べ圧倒的に人口が多い', 1, 1),
  ('sj02b', 'sj02', '2', '人口が均等に分布している', 0, 2),
  ('sj02c', 'sj02', '3', '工業都市として発展した', 0, 3),
  ('sj02d', 'sj02', '4', '人口が減少傾向にある', 0, 4);

-- ── 生活文化 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('sc01', 'soc_chiiki_minzoku', '世界で信者数が最も多い宗教はどれか。', 'choice', 1, 3, 'キリスト教が約23億人で世界最大。次いでイスラム教約19億人。', 'original'),
  ('sc02', 'soc_chiiki_chishi', '東南アジアで唯一ヨーロッパの植民地にならなかった国はどれか。', 'choice', 2, 4, 'タイ(旧シャム)は、英仏の緩衝地帯として独立を維持した。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('sc01a', 'sc01', '1', 'キリスト教', 1, 1), ('sc01b', 'sc01', '2', 'イスラム教', 0, 2),
  ('sc01c', 'sc01', '3', '仏教', 0, 3), ('sc01d', 'sc01', '4', 'ヒンドゥー教', 0, 4),
  ('sc02a', 'sc02', '1', 'タイ', 1, 1), ('sc02b', 'sc02', '2', 'ベトナム', 0, 2),
  ('sc02c', 'sc02', '3', 'フィリピン', 0, 3), ('sc02d', 'sc02', '4', 'ミャンマー', 0, 4);

-- ── 地図・地域 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('sz01', 'soc_chizu_chizu', '縮尺1:25,000の地形図上で4cmの距離は実際には何mか。', 'choice', 1, 3, '4cm × 25,000 = 100,000cm = 1,000m = 1km', 'original'),
  ('sz02', 'soc_chizu_gis', 'GIS(地理情報システム)のレイヤー構造の説明として正しいものはどれか。', 'choice', 2, 4, 'GISでは地形、道路、建物等の情報を別々のレイヤーとして重ね合わせて分析できる。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('sz01a', 'sz01', '1', '1,000m', 1, 1), ('sz01b', 'sz01', '2', '100m', 0, 2),
  ('sz01c', 'sz01', '3', '10,000m', 0, 3), ('sz01d', 'sz01', '4', '250m', 0, 4),
  ('sz02a', 'sz02', '1', '異なる地理情報を別々の層として重ね合わせる仕組み', 1, 1),
  ('sz02b', 'sz02', '2', '3Dプリンターで地形を再現する技術', 0, 2),
  ('sz02c', 'sz02', '3', '衛星画像を撮影する技術', 0, 3),
  ('sz02d', 'sz02', '4', 'GPSで現在地を特定する技術', 0, 4);


-- ████████████████████████████████████████████████████████████
-- ██ 情報I (100点)                                         ██
-- ████████████████████████████████████████████████████████████

-- ── 情報社会 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('ij01', 'info_joho_moral', '個人情報保護法において「個人情報」に該当しないものはどれか。', 'choice', 2, 4, '統計データとして匿名加工された情報は個人を特定できないため個人情報に該当しない。', 'original'),
  ('ij02', 'info_joho_mondai', '著作権法における「引用」の条件として正しいものはどれか。', 'choice', 2, 4, '引用の条件: ①主従関係(自分の文章が主)、②出典明記、③引用部分を明示。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('ij01a', 'ij01', '1', '匿名加工された統計データ', 1, 1),
  ('ij01b', 'ij01', '2', '氏名と電話番号', 0, 2),
  ('ij01c', 'ij01', '3', 'メールアドレス', 0, 3),
  ('ij01d', 'ij01', '4', '顔写真', 0, 4),
  ('ij02a', 'ij02', '1', '自分の文章が主で、出典を明記し、引用部分を明示する', 1, 1),
  ('ij02b', 'ij02', '2', '全文を自由にコピーしてよい', 0, 2),
  ('ij02c', 'ij02', '3', '商用利用でなければ条件はない', 0, 3),
  ('ij02d', 'ij02', '4', '著者の許可を取れば出典は不要', 0, 4);

-- ── 情報デザイン ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('id01', 'info_comm_design', 'ユニバーサルデザインの原則として正しいものはどれか。', 'choice', 2, 4, 'ユニバーサルデザインは年齢、性別、障害の有無に関わらず、すべての人が利用しやすい設計。', 'original'),
  ('id02', 'info_comm_media', 'ピクトグラムの利点として正しいものはどれか。', 'choice', 1, 3, 'ピクトグラムは言語に依存しない絵記号で、国際的なコミュニケーションに有効。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('id01a', 'id01', '1', '年齢や障害に関わらず誰でも使えること', 1, 1),
  ('id01b', 'id01', '2', 'デザインの美しさを最優先すること', 0, 2),
  ('id01c', 'id01', '3', 'コストを最小限に抑えること', 0, 3),
  ('id01d', 'id01', '4', '最新技術を使うこと', 0, 4),
  ('id02a', 'id02', '1', '言語に依存せず国際的に理解しやすい', 1, 1),
  ('id02b', 'id02', '2', '複雑な情報を詳細に伝えられる', 0, 2),
  ('id02c', 'id02', '3', 'テキストより情報量が多い', 0, 3),
  ('id02d', 'id02', '4', 'アニメーション効果がある', 0, 4);

-- ── プログラミング (追加) ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('ic02', 'info_comp_algo', '配列 [5, 2, 8, 1, 9] をバブルソートで昇順に並べ替えるとき、1回目のパス後の配列はどれか。', 'choice', 3, 4, 'バブルソート1パス: 隣接要素を比較して交換。[2,5,1,8,9]が1パス後の結果。', 'original'),
  ('ic03', 'info_comp_prog', '次のプログラムの出力は？\nx = 1\nfor i in range(4):\n    x = x * 2\nprint(x)', 'choice', 2, 4, 'x: 1→2→4→8→16。4回2倍するので16。', 'original'),
  ('ic04', 'info_comp_algo', '2分探索法で要素数1000の整列済み配列から値を探すとき、最大比較回数は約何回か。', 'choice', 3, 4, 'log₂1000 ≈ 10回。2分探索は毎回半分に絞れるため。', 'original'),
  ('ic05', 'info_comp_prog', '次のプログラムの出力は？\ndef f(n):\n    if n <= 1:\n        return 1\n    return n * f(n-1)\nprint(f(5))', 'choice', 3, 4, 'f(5) = 5×f(4) = 5×4×f(3) = ... = 5! = 120', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('ic02a', 'ic02', '1', '[2,5,1,8,9]', 1, 1), ('ic02b', 'ic02', '2', '[1,2,5,8,9]', 0, 2),
  ('ic02c', 'ic02', '3', '[5,2,1,8,9]', 0, 3), ('ic02d', 'ic02', '4', '[2,1,5,8,9]', 0, 4),
  ('ic03a', 'ic03', '1', '16', 1, 1), ('ic03b', 'ic03', '2', '8', 0, 2),
  ('ic03c', 'ic03', '3', '32', 0, 3), ('ic03d', 'ic03', '4', '4', 0, 4),
  ('ic04a', 'ic04', '1', '約10回', 1, 1), ('ic04b', 'ic04', '2', '約100回', 0, 2),
  ('ic04c', 'ic04', '3', '約500回', 0, 3), ('ic04d', 'ic04', '4', '約1000回', 0, 4),
  ('ic05a', 'ic05', '1', '120', 1, 1), ('ic05b', 'ic05', '2', '24', 0, 2),
  ('ic05c', 'ic05', '3', '720', 0, 3), ('ic05d', 'ic05', '4', '60', 0, 4);

-- ── ネットワーク ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('in01', 'info_network_proto', 'IPアドレス「192.168.1.1」はどのクラスに属するか。', 'choice', 2, 4, '192.168.x.xはクラスCのプライベートIPアドレス。', 'original'),
  ('in02', 'info_network_proto', 'HTTPSの「S」が意味するものは何か。', 'choice', 1, 3, 'HTTPS = HTTP + Secure。SSL/TLSによる暗号化通信。', 'original'),
  ('in03', 'info_network_security', '公開鍵暗号方式の特徴として正しいものはどれか。', 'choice', 3, 4, '公開鍵暗号方式は暗号化に公開鍵、復号に秘密鍵を使う。鍵の配送問題を解決する。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('in01a', 'in01', '1', 'クラスC', 1, 1), ('in01b', 'in01', '2', 'クラスA', 0, 2),
  ('in01c', 'in01', '3', 'クラスB', 0, 3), ('in01d', 'in01', '4', 'クラスD', 0, 4),
  ('in02a', 'in02', '1', 'Secure(暗号化)', 1, 1), ('in02b', 'in02', '2', 'Speed(高速)', 0, 2),
  ('in02c', 'in02', '3', 'Simple(簡易)', 0, 3), ('in02d', 'in02', '4', 'Standard(標準)', 0, 4),
  ('in03a', 'in03', '1', '暗号化に公開鍵、復号に秘密鍵を使う', 1, 1),
  ('in03b', 'in03', '2', '同じ鍵で暗号化・復号を行う', 0, 2),
  ('in03c', 'in03', '3', 'パスワードだけで暗号化する', 0, 3),
  ('in03d', 'in03', '4', '暗号化は不要で認証のみ行う', 0, 4);

-- ── データ活用 ──
INSERT OR IGNORE INTO questions (id, unit_id, body, question_type, difficulty, points, explanation, source) VALUES
  ('idb01', 'info_data_bunseki', '次のデータの箱ひげ図で「四分位範囲」とは何か。\nデータ: 10, 20, 30, 40, 50, 60, 70', 'choice', 2, 4, '四分位範囲 = Q3-Q1 = 第3四分位数-第1四分位数。データの中央50%の範囲。', 'original'),
  ('idb02', 'info_data_db', 'リレーショナルデータベースにおける「主キー」の条件として正しいものはどれか。', 'choice', 2, 4, '主キーは一意性（重複なし）かつNOT NULL（空でない）が条件。', 'original'),
  ('idb03', 'info_data_bunseki', '度数分布表のヒストグラムで、最も度数が大きい階級を何というか。', 'choice', 1, 3, '最も度数が大きい階級の値を「最頻値（モード）」という。', 'original');

INSERT OR IGNORE INTO choices (id, question_id, label, body, is_correct, display_order) VALUES
  ('idb01a', 'idb01', '1', '第3四分位数と第1四分位数の差', 1, 1),
  ('idb01b', 'idb01', '2', '最大値と最小値の差', 0, 2),
  ('idb01c', 'idb01', '3', '平均値と中央値の差', 0, 3),
  ('idb01d', 'idb01', '4', '標準偏差の2倍', 0, 4),
  ('idb02a', 'idb02', '1', '一意性(重複なし)かつNOT NULL', 1, 1),
  ('idb02b', 'idb02', '2', '数値型でなければならない', 0, 2),
  ('idb02c', 'idb02', '3', 'NULLを含んでもよい', 0, 3),
  ('idb02d', 'idb02', '4', '重複があってもよい', 0, 4),
  ('idb03a', 'idb03', '1', '最頻値(モード)', 1, 1), ('idb03b', 'idb03', '2', '中央値(メディアン)', 0, 2),
  ('idb03c', 'idb03', '3', '平均値', 0, 3), ('idb03d', 'idb03', '4', '分散', 0, 4);
