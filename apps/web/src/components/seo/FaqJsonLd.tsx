import { FAQ } from "@kyoutsu/shared";

/**
 * FAQ構造化データ (JSON-LD) コンポーネント
 * Google検索でFAQリッチスニペットを表示し、検索結果での認知度を向上させる。
 */
export function FaqJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
