"use client";

interface ReviewAlertProps {
  count: number;
}

export function ReviewAlert({ count }: ReviewAlertProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">復習アラート</h3>
        <span className="text-xs text-gray-500">忘却曲線</span>
      </div>
      <div className="text-3xl font-mono font-bold text-amber-400">
        {count}<span className="text-sm text-gray-400 ml-1">問</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">本日の復習対象</p>
      <a
        href="/study/review"
        className="mt-3 block w-full text-center py-2 bg-amber-600/20 text-amber-400
                   rounded-lg text-sm hover:bg-amber-600/30 transition-colors"
      >
        復習を始める
      </a>
    </div>
  );
}
