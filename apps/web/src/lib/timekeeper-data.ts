/**
 * タイムキーパーさん — 学習ロードマップデータ
 *
 * 季節×曜日で1日の学習可能時間を管理
 * 各日にタスクを配分し、タイル形式で進捗管理
 */

export interface DayTile {
  date: string;         // YYYY-MM-DD
  dayOfWeek: number;    // 0=日, 1=月, ...
  availableHours: number;
  tasks: DayTask[];
  status: "completed" | "today" | "upcoming" | "past_incomplete";
}

export interface DayTask {
  id: string;
  subject: string;
  subjectColor: string;
  fieldName: string;
  taskType: "new_learn" | "review" | "weakness" | "exam";
  questionCount: number;
  estimatedMinutes: number;
  completed: boolean;
}

/** 季節別 × 曜日別の学習可能時間 (時間) */
export interface ScheduleConfig {
  /** 春学期 (4-7月) 平日/休日 */
  spring: { weekday: number; weekend: number };
  /** 夏休み (7-8月) */
  summer: { weekday: number; weekend: number };
  /** 秋学期 (9-12月) */
  autumn: { weekday: number; weekend: number };
  /** 冬休み〜直前期 (12-1月) */
  winter: { weekday: number; weekend: number };
}

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  spring:  { weekday: 3, weekend: 6 },
  summer:  { weekday: 8, weekend: 8 },
  autumn:  { weekday: 4, weekend: 7 },
  winter:  { weekday: 6, weekend: 8 },
};

const SUBJECT_COLORS: Record<string, string> = {
  "国語": "#f97316",
  "数IA": "#3b82f6",
  "数IIB": "#6366f1",
  "英語R": "#ec4899",
  "英語L": "#f43f5e",
  "物理": "#14b8a6",
  "化学": "#8b5cf6",
  "社会": "#eab308",
  "情報": "#06b6d4",
  "模試": "#ef4444",
};

function getSeason(month: number): keyof ScheduleConfig {
  if (month >= 4 && month <= 6) return "spring";
  if (month >= 7 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function getAvailableHours(date: Date, config: ScheduleConfig): number {
  const season = getSeason(date.getMonth() + 1);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  return isWeekend ? config[season].weekend : config[season].weekday;
}

/** 学習タスクテンプレート (1時間あたりのタスク) */
const TASK_TEMPLATES: Omit<DayTask, "id" | "completed">[] = [
  { subject: "数IA", subjectColor: SUBJECT_COLORS["数IA"], fieldName: "確率 演習", taskType: "weakness", questionCount: 10, estimatedMinutes: 40 },
  { subject: "数IIB", subjectColor: SUBJECT_COLORS["数IIB"], fieldName: "ベクトル 演習", taskType: "weakness", questionCount: 8, estimatedMinutes: 45 },
  { subject: "英語R", subjectColor: SUBJECT_COLORS["英語R"], fieldName: "第6問 長文", taskType: "new_learn", questionCount: 3, estimatedMinutes: 50 },
  { subject: "英語L", subjectColor: SUBJECT_COLORS["英語L"], fieldName: "第5問 講義", taskType: "weakness", questionCount: 5, estimatedMinutes: 30 },
  { subject: "物理", subjectColor: SUBJECT_COLORS["物理"], fieldName: "電磁気 復習", taskType: "review", questionCount: 8, estimatedMinutes: 40 },
  { subject: "化学", subjectColor: SUBJECT_COLORS["化学"], fieldName: "有機化学 ドリル", taskType: "weakness", questionCount: 10, estimatedMinutes: 45 },
  { subject: "国語", subjectColor: SUBJECT_COLORS["国語"], fieldName: "古文 読解", taskType: "new_learn", questionCount: 5, estimatedMinutes: 35 },
  { subject: "国語", subjectColor: SUBJECT_COLORS["国語"], fieldName: "漢文 基礎", taskType: "weakness", questionCount: 8, estimatedMinutes: 30 },
  { subject: "社会", subjectColor: SUBJECT_COLORS["社会"], fieldName: "人口・都市", taskType: "new_learn", questionCount: 10, estimatedMinutes: 35 },
  { subject: "情報", subjectColor: SUBJECT_COLORS["情報"], fieldName: "プログラミング", taskType: "new_learn", questionCount: 8, estimatedMinutes: 30 },
  { subject: "物理", subjectColor: SUBJECT_COLORS["物理"], fieldName: "波動 演習", taskType: "new_learn", questionCount: 8, estimatedMinutes: 40 },
  { subject: "化学", subjectColor: SUBJECT_COLORS["化学"], fieldName: "高分子 復習", taskType: "review", questionCount: 6, estimatedMinutes: 25 },
  { subject: "数IA", subjectColor: SUBJECT_COLORS["数IA"], fieldName: "図形 復習", taskType: "review", questionCount: 8, estimatedMinutes: 35 },
  { subject: "数IIB", subjectColor: SUBJECT_COLORS["数IIB"], fieldName: "微積分 演習", taskType: "new_learn", questionCount: 6, estimatedMinutes: 45 },
  { subject: "英語R", subjectColor: SUBJECT_COLORS["英語R"], fieldName: "第4問 図表", taskType: "new_learn", questionCount: 4, estimatedMinutes: 35 },
  { subject: "模試", subjectColor: SUBJECT_COLORS["模試"], fieldName: "過去問演習", taskType: "exam", questionCount: 0, estimatedMinutes: 180 },
];

/** サンプルタイルデータ生成 */
export function generateTiles(
  startDate: Date,
  examDate: Date,
  config: ScheduleConfig = DEFAULT_SCHEDULE,
  completedDays: number = 5,
): DayTile[] {
  const tiles: DayTile[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  let templateIdx = 0;

  while (current <= examDate) {
    const dateStr = current.toISOString().slice(0, 10);
    const dayOfWeek = current.getDay();
    const hours = getAvailableHours(current, config);

    // 1日分のタスクを生成 (時間に応じて2-6個)
    const taskCount = Math.max(2, Math.min(6, Math.floor(hours * 0.8)));
    const tasks: DayTask[] = [];
    let totalMinutes = 0;

    // 日曜日は模試デーにする (月1回)
    const dayNum = Math.floor((current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const isMoshiDay = dayOfWeek === 0 && dayNum % 28 < 7;

    if (isMoshiDay) {
      tasks.push({
        ...TASK_TEMPLATES[TASK_TEMPLATES.length - 1],
        id: `${dateStr}-exam`,
        completed: current < today,
      });
    } else {
      for (let i = 0; i < taskCount && totalMinutes < hours * 60 - 15; i++) {
        const template = TASK_TEMPLATES[templateIdx % (TASK_TEMPLATES.length - 1)];
        templateIdx++;
        if (totalMinutes + template.estimatedMinutes > hours * 60 + 10) break;
        tasks.push({
          ...template,
          id: `${dateStr}-${i}`,
          completed: current < today || (current.getTime() === today.getTime() && i < completedDays % 3),
        });
        totalMinutes += template.estimatedMinutes;
      }
    }

    let status: DayTile["status"];
    if (current.getTime() === today.getTime()) {
      status = "today";
    } else if (current < today) {
      const allDone = tasks.every((t) => t.completed);
      status = allDone ? "completed" : "past_incomplete";
    } else {
      status = "upcoming";
    }

    tiles.push({ date: dateStr, dayOfWeek, availableHours: hours, tasks, status });
    current.setDate(current.getDate() + 1);
  }

  return tiles;
}

/** タイムキーパーさんのセリフ */
export function getTimekeeperMessage(tile: DayTile, remainingDays: number): string {
  const completedTasks = tile.tasks.filter((t) => t.completed).length;
  const totalTasks = tile.tasks.length;

  if (tile.status === "completed") return "ナイスセーブ！完璧だ！";
  if (completedTasks === totalTasks && tile.status === "today") return "全タスク完了！余裕があれば明日の分も先取りしよう！";
  if (completedTasks > 0 && tile.status === "today") return `あと${totalTasks - completedTasks}タスク！ゴールはすぐそこだ！`;
  if (tile.status === "today") return "さあ今日のキックオフだ！";
  if (remainingDays <= 30) return "直前期！1日1日が勝負だ！";
  if (remainingDays <= 90) return "ラストスパートが見えてきた！";
  return "コツコツ積み上げていこう！";
}
