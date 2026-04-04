"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://kyoutsu-api.miyata-d23.workers.dev";

interface Subject { id: string; name: string; max_score: number; display_order: number }
interface Field { id: string; subject_id: string; name: string; display_order: number }
interface Unit { id: string; field_id: string; name: string; display_order: number }
interface QCount { unit_id: string; count: number }
interface Tag { id: string; name: string; label: string; color: string }
interface UnitTag { unit_id: string; tag_id: string; label: string; color: string }
interface Prediction { unit_id: string; score: number; reasoning: string; unit_name: string; field_name: string; subject_id: string }

interface ContentTree {
  subjects: Subject[]; fields: Field[]; units: Unit[];
  questionCounts: QCount[]; tags: Tag[]; unitTags: UnitTag[];
  predictions: Prediction[];
}

type Tab = "curriculum" | "questions" | "predictions";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("curriculum");
  const [tree, setTree] = useState<ContentTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  const fetchTree = async () => {
    const token = getToken();
    const res = await fetch(`${API}/admin/content-tree`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTree(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTree(); }, []);

  const handleCalculatePredictions = async () => {
    setCalculating(true);
    const token = getToken();
    await fetch(`${API}/admin/predictions/calculate`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ targetYear: 2027 }),
    });
    await fetchTree();
    setCalculating(false);
  };

  if (loading) return <LoadingScreen />;
  if (!tree) return <div className="min-h-screen flex items-center justify-center text-gray-400">データ取得失敗</div>;

  const getQCount = (unitId: string) => tree.questionCounts.find((q) => q.unit_id === unitId)?.count || 0;
  const getUnitTags = (unitId: string) => tree.unitTags.filter((ut) => ut.unit_id === unitId);
  const getPrediction = (unitId: string) => tree.predictions.find((p) => p.unit_id === unitId);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-500 text-sm">← ホーム</a>
            <h1 className="text-lg font-bold">管理画面</h1>
          </div>
          <div className="text-xs text-gray-500">
            {tree.subjects.length}科目 / {tree.fields.length}分野 / {tree.units.length}単元
          </div>
        </div>
        {/* タブ */}
        <div className="max-w-5xl mx-auto flex gap-1 mt-2">
          {([["curriculum", "カリキュラム"], ["questions", "問題管理"], ["predictions", "出題予想"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* ─── カリキュラムツリー ─── */}
        {tab === "curriculum" && (
          <div className="space-y-2">
            {tree.subjects.map((subject) => {
              const sFields = tree.fields.filter((f) => f.subject_id === subject.id);
              const isExpanded = expandedSubject === subject.id;

              return (
                <div key={subject.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <button onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors">
                    <span className="text-sm">{isExpanded ? "▼" : "▶"}</span>
                    <span className="font-bold">{subject.name}</span>
                    <span className="text-xs text-gray-500">{subject.max_score}点</span>
                    <span className="text-xs text-gray-600 ml-auto">{sFields.length}分野</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-800 px-3 pb-3">
                      {sFields.map((field) => {
                        const fUnits = tree.units.filter((u) => u.field_id === field.id);
                        const fExpanded = expandedField === field.id;

                        return (
                          <div key={field.id} className="mt-2">
                            <button onClick={() => setExpandedField(fExpanded ? null : field.id)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/30 text-left">
                              <span className="text-xs text-gray-600">{fExpanded ? "▼" : "▶"}</span>
                              <span className="text-sm font-medium">{field.name}</span>
                              <span className="text-xs text-gray-600 ml-auto">{fUnits.length}単元</span>
                            </button>

                            {fExpanded && (
                              <div className="ml-4 space-y-1 mt-1">
                                {fUnits.map((unit) => {
                                  const qc = getQCount(unit.id);
                                  const tags = getUnitTags(unit.id);
                                  const pred = getPrediction(unit.id);

                                  return (
                                    <div key={unit.id}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30 border border-gray-800/50">
                                      <span className="text-sm flex-1">{unit.name}</span>
                                      {/* タグ */}
                                      <div className="flex gap-1">
                                        {tags.map((t) => (
                                          <span key={t.tag_id} className="text-[9px] px-1.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: `${t.color}22`, color: t.color }}>
                                            {t.label}
                                          </span>
                                        ))}
                                      </div>
                                      {/* 予想スコア */}
                                      {pred && (
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                                          style={{
                                            backgroundColor: pred.score >= 60 ? "#ef444422" : pred.score >= 30 ? "#eab30822" : "#37415122",
                                            color: pred.score >= 60 ? "#ef4444" : pred.score >= 30 ? "#eab308" : "#6b7280",
                                          }}>
                                          予{pred.score}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-600">{qc}問</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── 問題管理 ─── */}
        {tab === "questions" && <QuestionsTab tree={tree} onRefresh={fetchTree} />}

        {/* ─── 出題予想 ─── */}
        {tab === "predictions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">2027年度 出題予想</h2>
              <button onClick={handleCalculatePredictions} disabled={calculating}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 rounded-lg text-sm transition-colors">
                {calculating ? "算出中..." : "予想スコア一括算出"}
              </button>
            </div>

            {tree.predictions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">予想データなし</p>
                <p className="text-sm">「予想スコア一括算出」で出題予想を計算してください</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tree.predictions.map((pred, i) => (
                  <div key={pred.unit_id} className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-600 w-6">{i + 1}</span>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                      style={{
                        backgroundColor: pred.score >= 60 ? "#ef444422" : pred.score >= 30 ? "#eab30822" : "#37415122",
                        color: pred.score >= 60 ? "#ef4444" : pred.score >= 30 ? "#eab308" : "#6b7280",
                      }}>
                      {pred.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{pred.unit_name}</div>
                      <div className="text-[10px] text-gray-500">{pred.field_name} ({pred.subject_id})</div>
                      <div className="text-[10px] text-gray-600 mt-0.5 truncate">{pred.reasoning}</div>
                    </div>
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full" style={{
                        width: `${pred.score}%`,
                        backgroundColor: pred.score >= 60 ? "#ef4444" : pred.score >= 30 ? "#eab308" : "#6b7280",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/** 問題管理タブ */
function QuestionsTab({ tree, onRefresh }: { tree: ContentTree; onRefresh: () => void }) {
  const [questions, setQuestions] = useState<{
    id: string; body: string; difficulty: number; points: number;
    unit_name: string; field_name: string; subject_id: string;
  }[]>([]);
  const [selectedField, setSelectedField] = useState("");
  const [qLoading, setQLoading] = useState(false);

  const fetchQuestions = async (fieldId?: string) => {
    setQLoading(true);
    const token = getToken();
    const q = fieldId ? `?fieldId=${fieldId}` : "";
    const res = await fetch(`${API}/admin/questions${q}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json() as { questions: typeof questions };
      setQuestions(data.questions);
    }
    setQLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  return (
    <div>
      {/* フィルター */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={selectedField}
          onChange={(e) => { setSelectedField(e.target.value); fetchQuestions(e.target.value || undefined); }}
          className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm">
          <option value="">全分野</option>
          {tree.subjects.map((s) => (
            <optgroup key={s.id} label={s.name}>
              {tree.fields.filter((f) => f.subject_id === s.id).map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="text-xs text-gray-500 self-center">{questions.length}件</span>
      </div>

      {/* 問題一覧 */}
      {qLoading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">問題がありません</p>
          <p className="text-sm">APIまたはCSVで問題を追加してください</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="p-3 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">
                    {q.field_name} › {q.unit_name} ｜ 難易度{"★".repeat(q.difficulty)}{"☆".repeat(5 - q.difficulty)} ｜ {q.points}点
                  </div>
                  <div className="text-sm whitespace-pre-wrap line-clamp-3">{q.body}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-500 shrink-0">{q.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-4xl animate-pulse mb-2">⚙️</div><p className="text-sm text-gray-500">管理データ読み込み中...</p></div>
    </div>
  );
}
