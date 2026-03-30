/**
 * #8 エラー監視 — クライアントエラーレポーター
 * 本番エラーをコンソール + API にレポート
 */

const REPORT_URL = "https://kyoutsu-api.miyata-d23.workers.dev";

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export function initErrorReporter() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (e) => {
    reportError({
      message: e.message,
      stack: e.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    reportError({
      message: String(e.reason),
      stack: e.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });
}

function reportError(report: ErrorReport) {
  console.error("[ErrorReporter]", report.message);

  // Web Vitals 的な情報も付与
  const entry = performance?.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
  const extra = entry ? { loadTime: Math.round(entry.loadEventEnd - entry.fetchStart) } : {};

  // Fire-and-forget: APIにレポート送信 (将来的にSentryに置き換え可能)
  fetch(`${REPORT_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "client_error", ...report, ...extra }),
  }).catch(() => {});
}

/** Web Vitals 収集 */
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // 簡易LCP計測
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1];
    console.log(`[WebVitals] LCP: ${Math.round(last.startTime)}ms`);
  });

  try {
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
}
