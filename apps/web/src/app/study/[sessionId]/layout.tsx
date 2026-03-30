export function generateStaticParams() {
  return [{ sessionId: "demo" }];
}

export default function StudySessionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
