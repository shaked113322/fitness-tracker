export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Plus, Scale, TrendingDown, TrendingUp, Target } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import WeightChart from "@/components/WeightChart";
import GoalsSection from "./GoalsSection";

export default async function BodyStatsPage() {
  const session = await getSession();
  const [stats, goals] = await Promise.all([
    prisma.bodyStat.findMany({ where: { userId: session!.id }, orderBy: { date: "desc" } }),
    prisma.goal.findMany({ where: { userId: session!.id } }),
  ]);

  const latest = stats[0];
  const previous = stats[1];

  const makeChart = (key: keyof typeof latest) =>
    stats.filter((s) => s[key] != null).map((s) => ({ date: format(new Date(s.date), "d/M"), value: s[key] as number })).reverse();

  const charts = [
    { key: "weight", label: 'משקל (ק"ג)', color: "#f97316" },
    { key: "chest", label: 'חזה (ס"מ)', color: "#3b82f6" },
    { key: "waist", label: 'מותן (ס"מ)', color: "#22c55e" },
    { key: "hips", label: 'ירך (ס"מ)', color: "#a855f7" },
    { key: "arms", label: 'זרועות (ס"מ)', color: "#f59e0b" },
    { key: "legs", label: 'רגליים (ס"מ)', color: "#ec4899" },
    { key: "bodyFat", label: "שומן (%)", color: "#ef4444" },
  ] as const;

  const goalsMap = Object.fromEntries(goals.map((g) => [g.metric, g.target]));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">מדדי גוף</h1>
        <Link href="/body-stats/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />עדכן מדדים
        </Link>
      </div>

      {/* Current stats */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: "weight", label: 'משקל (ק"ג)', lower: false },
            { key: "chest", label: 'חזה (ס"מ)', lower: false },
            { key: "waist", label: 'מותן (ס"מ)', lower: true },
            { key: "hips", label: 'ירך (ס"מ)', lower: false },
            { key: "arms", label: 'זרועות (ס"מ)', lower: false },
            { key: "bodyFat", label: "שומן (%)", lower: true },
          ].map(({ key, label, lower }) => (
            <StatItem
              key={key}
              label={label}
              value={latest[key as keyof typeof latest] as number | null | undefined}
              prev={previous?.[key as keyof typeof previous] as number | null | undefined}
              goal={goalsMap[key]}
              lower={lower}
            />
          ))}
        </div>
      )}

      {/* Goals */}
      <GoalsSection initialGoals={goals} latestStats={latest ? {
        weight: latest.weight, chest: latest.chest, waist: latest.waist,
        hips: latest.hips, arms: latest.arms, legs: latest.legs, bodyFat: latest.bodyFat,
      } : null} />

      {/* Charts */}
      {charts.map(({ key, label, color }) => {
        const data = makeChart(key);
        return data.length >= 2 ? (
          <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4">גרף {label}</h2>
            <WeightChart data={data} label={label} color={color} />
          </div>
        ) : null;
      })}

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">היסטוריה</h2>
        {stats.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Scale className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">אין מדדים עדיין</p>
            <Link href="/body-stats/new" className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">הוסף מדד ראשון</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-white mb-2">{format(new Date(stat.date), "d בMMMM yyyy")}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {stat.weight && <span>משקל: <strong className="text-white">{stat.weight}</strong></span>}
                  {stat.chest && <span>חזה: <strong className="text-white">{stat.chest}</strong></span>}
                  {stat.waist && <span>מותן: <strong className="text-white">{stat.waist}</strong></span>}
                  {stat.hips && <span>ירך: <strong className="text-white">{stat.hips}</strong></span>}
                  {stat.arms && <span>זרועות: <strong className="text-white">{stat.arms}</strong></span>}
                  {stat.legs && <span>רגליים: <strong className="text-white">{stat.legs}</strong></span>}
                  {stat.bodyFat && <span>שומן: <strong className="text-white">{stat.bodyFat}%</strong></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, prev, goal, lower }: { label: string; value?: number | null; prev?: number | null; goal?: number; lower: boolean }) {
  const change = value != null && prev != null ? value - prev : null;
  const isGood = change !== null ? (lower ? change < 0 : change > 0) : null;
  const goalPct = goal != null && value != null ? Math.min(100, Math.round(lower ? (value <= goal ? 100 : (goal / value) * 100) : (value / goal) * 100)) : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      {change !== null && change !== 0 && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${isGood ? "text-green-400" : "text-red-400"}`}>
          {isGood ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {change > 0 ? "+" : ""}{change.toFixed(1)}
        </div>
      )}
      {goalPct !== null && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span className="flex items-center gap-1"><Target className="w-3 h-3" />יעד: {goal}</span>
            <span>{goalPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
