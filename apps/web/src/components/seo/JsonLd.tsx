/**
 * 構造化データ (JSON-LD) コンポーネント
 * Google検索でリッチリザルト表示を実現
 */
export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "大学物語",
    alternateName: "Daigaku Monogatari",
    url: "https://daigaku-monogatari.pages.dev",
    description:
      "弱点が見える。だから伸びる。— 共通テストに特化した学習プラットフォーム。忘却曲線(SM-2)×弱点自動検出×S&P500スタイル学習マップで効率的に志望大学合格を目指す。",
    slogan: "弱点が見える。だから伸びる。",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    author: {
      "@type": "Organization",
      name: "Shimanto AI",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    educationalLevel: "高校3年生・大学受験生",
    inLanguage: "ja",
    keywords: [
      "共通テスト",
      "大学受験",
      "東京大学",
      "忘却曲線",
      "SM-2",
      "学習マップ",
      "弱点検出",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
