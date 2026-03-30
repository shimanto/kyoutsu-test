"use client";

interface Task {
  subject: string;
  task: string;
  done: boolean;
}

interface TodayTasksProps {
  tasks: Task[];
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">今日のタスク</h3>
        <span className="text-xs text-gray-500">
          {doneCount}/{tasks.length} 完了
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-sm ${
              task.done ? "opacity-50" : ""
            }`}
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                task.done
                  ? "bg-green-600 border-green-600"
                  : "border-gray-600"
              }`}
            >
              {task.done && <span className="text-[10px]">✓</span>}
            </div>
            <span className="text-xs text-gray-500 w-10 shrink-0">
              {task.subject}
            </span>
            <span className={task.done ? "line-through" : ""}>
              {task.task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
