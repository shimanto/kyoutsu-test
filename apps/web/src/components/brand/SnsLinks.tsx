import { getActiveSnsAccounts } from "@kyoutsu/shared";

const SNS_ICONS: Record<string, React.ReactNode> = {
  "X (Twitter)": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LINE公式アカウント: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  ),
  YouTube: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

/**
 * SNSリンク集コンポーネント
 * 開設済みのSNSアカウントのみ表示する。
 */
export function SnsLinks({ className = "" }: { className?: string }) {
  const accounts = getActiveSnsAccounts();

  if (accounts.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {accounts.map((account) => (
        <a
          key={account.label}
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50
                     hover:bg-gray-700/50 text-gray-400 hover:text-gray-200
                     transition-colors text-xs"
          title={account.purpose}
        >
          {SNS_ICONS[account.label]}
          <span>{account.label}</span>
        </a>
      ))}
    </div>
  );
}

/**
 * SNSフォローCTA — LPやフッター用
 */
export function SnsFollowCta({ className = "" }: { className?: string }) {
  const accounts = getActiveSnsAccounts();

  if (accounts.length === 0) return null;

  return (
    <div className={`text-center ${className}`}>
      <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mb-3">Follow us</p>
      <p className="text-sm text-gray-400 mb-4">最新の学習Tips・アップデート情報をお届け</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {accounts.map((account) => (
          <a
            key={account.label}
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700
                       hover:border-gray-500 hover:bg-gray-900 text-gray-300 hover:text-white
                       transition-all text-sm"
          >
            {SNS_ICONS[account.label]}
            <span className="font-medium">{account.handle}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
