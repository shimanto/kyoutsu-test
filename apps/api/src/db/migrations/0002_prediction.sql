-- ============================================================
-- 出題予想・傾向分析テーブル
-- ============================================================

-- 章 (単元の下位。教科書の章立てに対応)
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id),
    name TEXT NOT NULL,
    description TEXT,
    textbook_ref TEXT,          -- 教科書参照 (例: "数研出版 p.123")
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 出題履歴 (過去何年度のどの大問で出たか)
CREATE TABLE IF NOT EXISTS exam_history (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id),
    year INTEGER NOT NULL,         -- 出題年度
    exam_type TEXT NOT NULL,       -- 'honshiken','tsuishiken'
    question_number TEXT,          -- 大問番号 (例: '第2問 問3')
    points INTEGER,                -- 配点
    difficulty INTEGER,            -- 難易度 1-5
    notes TEXT,                    -- 出題のポイント・メモ
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 傾向タグ (問題や単元に付与)
CREATE TABLE IF NOT EXISTS trend_tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,     -- 'high_frequency','new_curriculum','prediction_2026'
    label TEXT NOT NULL,           -- '頻出','新課程','2026予想'
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 問題 × タグ の中間テーブル
CREATE TABLE IF NOT EXISTS question_tags (
    question_id TEXT NOT NULL REFERENCES questions(id),
    tag_id TEXT NOT NULL REFERENCES trend_tags(id),
    PRIMARY KEY (question_id, tag_id)
);

-- 単元 × タグ の中間テーブル
CREATE TABLE IF NOT EXISTS unit_tags (
    unit_id TEXT NOT NULL REFERENCES units(id),
    tag_id TEXT NOT NULL REFERENCES trend_tags(id),
    PRIMARY KEY (unit_id, tag_id)
);

-- 出題予想スコア (単元ごとに算出)
CREATE TABLE IF NOT EXISTS prediction_scores (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id),
    target_year INTEGER NOT NULL,     -- 予想対象年度
    score REAL NOT NULL DEFAULT 0,    -- 0-100 の出題可能性スコア
    reasoning TEXT,                   -- 予想根拠
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(unit_id, target_year)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_exam_history_unit ON exam_history(unit_id, year);
CREATE INDEX IF NOT EXISTS idx_chapters_unit ON chapters(unit_id);
CREATE INDEX IF NOT EXISTS idx_prediction_year ON prediction_scores(target_year, score DESC);

-- 初期傾向タグ
INSERT OR IGNORE INTO trend_tags (id, name, label, color) VALUES
  ('tag_freq', 'high_frequency', '頻出', '#ef4444'),
  ('tag_new', 'new_curriculum', '新課程', '#8b5cf6'),
  ('tag_pred26', 'prediction_2026', '2026予想', '#f97316'),
  ('tag_pred27', 'prediction_2027', '2027予想', '#eab308'),
  ('tag_basic', 'basic', '基礎', '#22c55e'),
  ('tag_applied', 'applied', '応用', '#3b82f6'),
  ('tag_trap', 'common_trap', 'ひっかけ', '#ec4899');
