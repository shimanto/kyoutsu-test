"use client";

interface WeakPoint {
  fieldName: string;
  rate: number;
  subjectName: string;
  fieldId?: string;
}

interface WeakPointListProps {
  weakPoints: WeakPoint[];
  onFieldClick?: (fieldId: string) => void;
}

export function WeakPointList({ weakPoints, onFieldClick }: WeakPointListProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">弱点 TOP5</h3>
        <span className="text-xs text-gray-500">クリックで強化</span>
      </div>
      <div className="space-y-2">
        {weakPoints.map((wp, i) => (
          <button
            key={i}
            onClick={() => wp.fieldId && onFieldClick?.(wp.fieldId)}
            className="flex items-center gap-2 w-full text-left hover:bg-gray-800/50 rounded-lg px-1 py-1 -mx-1 transition-colors"
          >
            <span className="text-xs text-gray-600 w-4">{i + 1}</span>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm">{wp.fieldName}</span>
                <span className="text-xs text-gray-500">{wp.subjectName}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${wp.rate * 100}%`,
                    backgroundColor: wp.rate < 0.5 ? "#ef4444" : "#eab308",
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-mono text-red-400 w-10 text-right">
              {Math.round(wp.rate * 100)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
