export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Plus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import WeightChart from "@/components/WeightChart";

export default async function BodyStatsPage() {
  const stats = await prisma.bodyStat.findMany({
    orderBy: { date: "desc" },
  });

  const latest = stats[0];
  const previous = stats[1];

  const weightData = stats
    .filter((s) => s.weight)
    .map((s) => ({ date: format(new Date(s.date), "d/M"), value: s.weight! }))
    .reverse();

  const waistData = stats
    .filter((s) => s.waist)
    .map((s) => ({ date: format(new Date(s.date), "d/M"), value: s.waist! }))
    .reverse();

  const diff = (curr: number | null | undefined, prev: number | null | undefined) => {
    if (!curr || !prev) return null;
    return (curr - prev).toFixed(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">מדדי גוף</h1>
        <Link
          href="/body-stats/new"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          עדכן מדדים
        </Link>
      </div>

      {/* Current Stats */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatItem label='משקל (ק"ג)' value={latest.weight} prev={previous?.weight} />
          <StatItem label="חזה (ס&quot;מ)" value={latest.chest} prev={previous?.chest} />
          <StatItem label='מותן (ס"מ)' value={latest.waist} prev={previous?.waist} lower />
          <StatItem label='ירך (ס"מ)' value={latest.hips} prev={previous?.hips} />
          <StatItem label='זרועות (ס"מ)' value={latest.arms} prev={previous?.arms} />
          <StatItem label='אחוז שומן (%)' value={latest.bodyFat} prev={previous?.bodyFat} lower />
        </div>
      )}

      {/* Charts */}
      {weightData.length >= 2 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">גרף משקל</h2>
          <WeightChart data={weightData} label='משקל (ק"ג)' color="#f97316" />
        </div>
      )}

      {waistData.length >= 2 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">גרף מותן</h2>
          <WeightChart data={waistData} label='מותן (ס"מ)' color="#22c55e" />
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">היסטוריה</h2>
        {stats.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Scale className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">אין מדדים עדיין</p>
            <p className="text-gray-600 text-sm mt-1">התחל לעקוב אחרי המדדים שלך</p>
            <Link
              href="/body-stats/new"
              className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              הוסף מדד ראשון
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {format(new Date(stat.date), "d בMMMM yyyy")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {stat.weight && <span>משקל: <strong className="text-white">{stat.weight}</strong></span>}
                  {stat.chest && <span>חזה: <strong className="text-white">{stat.chest}</strong></span>}
                  {stat.waist && <span>מותן: <strong className="text-white">{stat.waist}</strong></span>}
                  {stat.hips && <span>ירך: <strong className="text-white">{stat.hips}</strong></span>}
                  {stat.arms && <span>זרועות: <strong className="text-white">{stat.arms}</strong></span>}
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

function StatItem({
  label,
  value,
  prev,
  lower = false,
}: {
  label: string;
  value: number | null | undefined;
  prev: number | null | undefined;
  lower?: boolean;
}) {
  const change = value && prev ? value - prev : null;
  const isGood = change !== null ? (lower ? change < 0 : change > 0) : null;
  const isNeutral = change === null || change === 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      {!isNeutral && change !== null && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${isGood ? "text-green-400" : "text-red-400"}`}>
          {isGood ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {change > 0 ? "+" : ""}{change.toFixed(1)}
        </div>
      )}
    </div>
  );
}
