"use client";

interface ScoreGaugeProps {
  current: number;
  target: number;
  max: number;
}

export function ScoreGauge({ current, target, max }: ScoreGaugeProps) {
  const currentPercent = (current / max) * 100;
  const targetPercent = (target / max) * 100;
  const cutoffPercent = (750 / max) * 100;

  // 色: 目標達成=緑, 足切り超え=黄, 足切り以下=赤
  const barColor =
    current >= target
      ? "from-green-600 to-green-400"
      : current >= 750
      ? "from-yellow-600 to-yellow-400"
      : "from-red-600 to-red-400";

  return (
    <div className="mt-3 relative">
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${currentPercent}%` }}
        />
      </div>

      {/* 足切りライン */}
      <div
        className="absolute top-0 h-4 border-l-2 border-dashed border-yellow-600/60"
        style={{ left: `${cutoffPercent}%` }}
      />

      {/* 目標ライン */}
      <div
        className="absolute top-0 h-4 border-l-2 border-green-400"
        style={{ left: `${targetPercent}%` }}
      />

      <div className="mt-1 flex justify-between text-[10px] text-gray-600">
        <span>0</span>
        <span style={{ position: "absolute", left: `${cutoffPercent}%`, transform: "translateX(-50%)" }}>
          足切り750
        </span>
        <span style={{ position: "absolute", left: `${targetPercent}%`, transform: "translateX(-50%)" }}
              className="text-green-500">
          目標{target}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}
