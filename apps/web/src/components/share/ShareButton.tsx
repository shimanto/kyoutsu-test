"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  /** 現在の推定得点 */
  currentScore: number;
  /** 目標得点 */
  targetScore: number;
  /** 各教科の推定得点 (表示用) */
  subjectScores?: { label: string; score: number; max: number }[];
}

function buildShareText(current: number, target: number): string {
  const rate = Math.round((current / 900) * 100);
  return [
    `共通テスト攻略中!`,
    `現在 ${current}/900点 (${rate}%)`,
    `目標 ${target}点まであと${target - current}点`,
    ``,
    `弱点が見える。だから伸びる。`,
    `#大学物語 #共通テスト攻略`,
    `https://daigaku-monogatari.pages.dev`,
  ].join("\n");
}

export function ShareButton({ currentScore, targetScore, subjectScores }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const text = buildShareText(currentScore, targetScore);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const shareToX = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [text]);

  const shareToLine = useCallback(() => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent("https://daigaku-monogatari.pages.dev")}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [text]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: "大学物語 — 学習進捗",
        text,
        url: "https://daigaku-monogatari.pages.dev",
      });
    } else {
      setOpen(true);
    }
  }, [text]);

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-600/30 text-green-400 text-xs
                   hover:bg-green-600/10 active:scale-95 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        成果をシェア
      </button>

      {/* シェアメニュー (Web Share API非対応ブラウザ向け) */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 min-w-[200px]">
            <p className="text-[10px] text-gray-500 mb-2">学習成果をシェア</p>

            {/* プレビュー */}
            <div className="bg-gray-800 rounded-lg p-2.5 mb-3 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {text}
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={shareToX}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
              >
                <span className="text-base">𝕏</span>
                <span>X (Twitter) でシェア</span>
              </button>
              <button
                onClick={shareToLine}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
              >
                <span className="text-base">💬</span>
                <span>LINE でシェア</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
              >
                <span className="text-base">{copied ? "✓" : "📋"}</span>
                <span>{copied ? "コピーしました!" : "テキストをコピー"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
