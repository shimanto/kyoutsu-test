-- ============================================================
-- 共通テスト攻略プラットフォーム DB Schema (Cloudflare D1)
-- ============================================================

PRAGMA foreign_keys = ON;

-- 1. ユーザー管理
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    line_user_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    picture_url TEXT,
    target_bunrui TEXT NOT NULL DEFAULT 'rika1',
    target_total_score INTEGER NOT NULL DEFAULT 750,
    exam_year INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_subject_targets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    subject_id TEXT NOT NULL,
    target_score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, subject_id)
);

-- 2. 科目 → 分野 → 単元
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    max_score INTEGER NOT NULL,
    display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fields (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL REFERENCES fields(id),
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL
);

-- 3. 問題・選択肢
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id),
    year INTEGER,
    question_number TEXT,
    body TEXT NOT NULL,
    image_url TEXT,
    question_type TEXT NOT NULL DEFAULT 'choice',
    difficulty INTEGER NOT NULL DEFAULT 3,
    points INTEGER NOT NULL DEFAULT 1,
    explanation TEXT,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS choices (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES questions(id),
    label TEXT NOT NULL,
    body TEXT NOT NULL,
    is_correct INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL
);

-- 4. 学習セッション・回答
CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    session_type TEXT NOT NULL,
    subject_id TEXT,
    field_id TEXT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    session_id TEXT REFERENCES study_sessions(id),
    question_id TEXT NOT NULL REFERENCES questions(id),
    chosen_choice_id TEXT REFERENCES choices(id),
    numeric_answer TEXT,
    is_correct INTEGER NOT NULL,
    time_spent_ms INTEGER,
    answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. 忘却曲線 / スペースドリピティション
CREATE TABLE IF NOT EXISTS review_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    question_id TEXT NOT NULL REFERENCES questions(id),
    ease_factor REAL NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    quality INTEGER,
    next_review_date TEXT NOT NULL,
    last_reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, question_id)
);

-- 6. 学習計画
CREATE TABLE IF NOT EXISTS study_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    generated_at TEXT NOT NULL DEFAULT (datetime('now')),
    exam_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS plan_daily_tasks (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES study_plans(id),
    scheduled_date TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    field_id TEXT REFERENCES fields(id),
    task_type TEXT NOT NULL,
    target_question_count INTEGER NOT NULL,
    completed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- 7. 模試・過去問
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    exam_type TEXT NOT NULL,
    time_limit_minutes INTEGER,
    total_score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exam_sections (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    time_limit_minutes INTEGER,
    max_score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_questions (
    exam_section_id TEXT NOT NULL REFERENCES exam_sections(id),
    question_id TEXT NOT NULL REFERENCES questions(id),
    display_order INTEGER NOT NULL,
    PRIMARY KEY (exam_section_id, question_id)
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    exam_id TEXT NOT NULL REFERENCES exams(id),
    started_at TEXT NOT NULL,
    finished_at TEXT,
    total_score INTEGER,
    score_breakdown TEXT
);

-- 8. LINE通知ログ
CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    notification_type TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    line_message_id TEXT
);

-- 9. ユーザーフィードバック
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    category TEXT NOT NULL DEFAULT 'general',
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT NOT NULL,
    page_url TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    admin_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status, created_at);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_answers_user_question ON answers(user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_review_next ON review_schedules(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_plan_tasks_date ON plan_daily_tasks(plan_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_questions_unit ON questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_fields_subject ON fields(subject_id);
CREATE INDEX IF NOT EXISTS idx_units_field ON units(field_id);
