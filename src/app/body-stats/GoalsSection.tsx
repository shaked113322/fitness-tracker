"use client";

import { useState } from "react";
import { Target, Edit2, Check, X, Trash2 } from "lucide-react";

interface Goal {
  id: string;
  metric: string;
  target: number;
}

interface LatestStats {
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arms: number | null;
  legs: number | null;
  bodyFat: number | null;
}

const METRICS = [
  { key: "weight", label: 'משקל (ק"ג)', lower: true },
  { key: "chest", label: 'חזה (ס"מ)', lower: false },
  { key: "waist", label: 'מותן (ס"מ)', lower: true },
  { key: "hips", label: 'ירך (ס"מ)', lower: false },
  { key: "arms", label: 'זרועות (ס"מ)', lower: false },
  { key: "legs", label: 'רגליים (ס"מ)', lower: false },
  { key: "bodyFat", label: "שומן (%)", lower: true },
];

export default function GoalsSection({ initialGoals, latestStats }: { initialGoals: Goal[]; latestStats: LatestStats | null }) {
  const [goals, setGoals] = useState<Record<string, number>>(
    Object.fromEntries(initialGoals.map((g) => [g.metric, g.target]))
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (metric: string) => {
    setDraft(goals[metric]?.toString() ?? "");
    setEditing(metric);
  };

  const saveGoal = async (metric: string) => {
    const val = parseFloat(draft);
    if (isNaN(val) || val <= 0) { setEditing(null); return; }
    setSaving(true);
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric, target: val }),
      });
      setGoals((prev) => ({ ...prev, [metric]: val }));
    } finally {
      setSaving(false);
      setEditing(null);
    }
  };

  const deleteGoal = async (metric: string) => {
    await fetch(`/api/goals?metric=${metric}`, { method: "DELETE" });
    setGoals((prev) => { const n = { ...prev }; delete n[metric]; return n; });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-orange-400" /> יעדים
      </h2>
      <div className="space-y-3">
        {METRICS.map(({ key, label, lower }) => {
          const target = goals[key];
          const current = latestStats?.[key as keyof LatestStats] ?? null;
          const pct = target != null && current != null
            ? Math.min(100, Math.round(lower ? (current <= target ? 100 : (target / current) * 100) : (current / target) * 100))
            : null;

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-28 shrink-0">{label}</span>
              {editing === key ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                    min="0"
                    step="0.1"
                    className="w-24 bg-gray-800 border border-orange-500 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                    onKeyDown={(e) => { if (e.key === "Enter") saveGoal(key); if (e.key === "Escape") setEditing(null); }}
                  />
                  <button onClick={() => saveGoal(key)} disabled={saving} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
                </div>
              ) : target != null ? (
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>יעד: <strong className="text-white">{target}</strong></span>
                      {pct !== null && <span className={pct >= 100 ? "text-green-400 font-semibold" : ""}>{pct}%</span>}
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct ?? 0}%` }} />
                    </div>
                  </div>
                  <button onClick={() => startEdit(key)} className="text-gray-600 hover:text-orange-400 shrink-0"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteGoal(key)} className="text-gray-600 hover:text-red-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(key)}
                  className="text-sm text-gray-600 hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <span>+ הגדר יעד</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
