export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Dumbbell, TrendingUp, Scale, Camera, Brain, Plus, Flame, Trophy, Target, Zap } from "lucide-react";
import Link from "next/link";
import { format, subDays, differenceInCalendarDays, startOfDay } from "date-fns";

function calcStreak(workouts: { date: Date }[]): number {
  if (workouts.length === 0) return 0;
  const days = Array.from(new Set(workouts.map((w) => startOfDay(w.date).getTime()))).sort((a, b) => b - a);
  const todayTs = startOfDay(new Date()).getTime();
  const yesterdayTs = startOfDay(subDays(new Date(), 1)).getTime();
  if (days[0] !== todayTs && days[0] !== yesterdayTs) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === 86400000) streak++;
    else break;
  }
  return streak;
}

function calcAchievements(totalWorkouts: number, streak: number, weightLost: number | null) {
  const all = [
    { id: "first", icon: "🏋️", label: "אימון ראשון", desc: "רשמת את האימון הראשון שלך", earned: totalWorkouts >= 1 },
    { id: "w10", icon: "🔟", label: "10 אימונים", desc: "הגעת ל-10 אימונים", earned: totalWorkouts >= 10 },
    { id: "w50", icon: "💪", label: "50 אימונים", desc: "חצי מאה אימונים!", earned: totalWorkouts >= 50 },
    { id: "w100", icon: "🏆", label: "100 אימונים", desc: "מאה אימונים — אגדה!", earned: totalWorkouts >= 100 },
    { id: "streak3", icon: "🔥", label: "רצף 3 ימים", desc: "3 ימי אימון ברציפות", earned: streak >= 3 },
    { id: "streak7", icon: "⚡", label: "שבוע שלם", desc: "7 ימי אימון ברציפות", earned: streak >= 7 },
    { id: "streak30", icon: "🌟", label: "חודש שלם", desc: "30 ימי אימון ברציפות", earned: streak >= 30 },
    { id: "lose5", icon: "📉", label: "ירידה של 5 ק״ג", desc: "ירדת 5 ק״ג ממשקל ההתחלה", earned: weightLost !== null && weightLost >= 5 },
  ];
  return all;
}

async function getDashboardData(userId: string) {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sevenDaysAgo = subDays(new Date(), 7);

  const [totalWorkouts, recentWorkouts, weekWorkouts, allWorkouts, latestBodyStat, previousBodyStat, totalPhotos, lastWorkouts, firstBodyStat] =
    await Promise.all([
      prisma.workout.count({ where: { userId } }),
      prisma.workout.count({ where: { userId, date: { gte: thirtyDaysAgo } } }),
      prisma.workout.count({ where: { userId, date: { gte: sevenDaysAgo } } }),
      prisma.workout.findMany({ where: { userId }, select: { date: true }, orderBy: { date: "desc" } }),
      prisma.bodyStat.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.bodyStat.findFirst({ where: { userId }, orderBy: { date: "desc" }, skip: 1 }),
      prisma.photo.count({ where: { userId } }),
      prisma.workout.findMany({ where: { userId }, take: 5, orderBy: { date: "desc" }, include: { exercises: true } }),
      prisma.bodyStat.findFirst({ where: { userId, weight: { not: null } }, orderBy: { date: "asc" } }),
    ]);

  return { totalWorkouts, recentWorkouts, weekWorkouts, allWorkouts, latestBodyStat, previousBodyStat, totalPhotos, lastWorkouts, firstBodyStat };
}

export default async function Dashboard() {
  const session = await getSession();
  const { totalWorkouts, recentWorkouts, weekWorkouts, allWorkouts, latestBodyStat, previousBodyStat, totalPhotos, lastWorkouts, firstBodyStat } =
    await getDashboardData(session!.id);

  const weightChange =
    latestBodyStat?.weight && previousBodyStat?.weight
      ? (latestBodyStat.weight - previousBodyStat.weight).toFixed(1)
      : null;

  const streak = calcStreak(allWorkouts);
  const weightLost = firstBodyStat?.weight && latestBodyStat?.weight
    ? firstBodyStat.weight - latestBodyStat.weight
    : null;
  const achievements = calcAchievements(totalWorkouts, streak, weightLost);
  const earnedAchievements = achievements.filter((a) => a.earned);

  // Weekly report
  const avgWorkoutsPerWeek = allWorkouts.length > 0
    ? Math.round((recentWorkouts / 4) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">שלום, {session!.username}! 💪</h1>
          <p className="text-gray-400 text-sm mt-1">{format(new Date(), "EEEE, d בMMMM yyyy")}</p>
        </div>
        <Link href="/workouts/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />אימון חדש
        </Link>
      </div>

      {/* Streak banner */}
      {streak >= 2 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <Flame className="w-6 h-6 text-orange-400 shrink-0" />
          <div>
            <p className="font-bold text-white">רצף של {streak} ימים! 🔥</p>
            <p className="text-sm text-gray-400">המשך כך — אתה בכושר מעולה</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="אימונים החודש" value={recentWorkouts.toString()} sub="ב-30 ימים אחרונים" color="orange" />
        <StatCard icon={<Dumbbell className="w-5 h-5 text-blue-400" />} label='סה"כ אימונים' value={totalWorkouts.toString()} sub="מהתחלה" color="blue" />
        <StatCard icon={<Scale className="w-5 h-5 text-green-400" />} label="משקל נוכחי" value={latestBodyStat?.weight ? `${latestBodyStat.weight} ק"ג` : "—"} sub={weightChange ? `${Number(weightChange) > 0 ? "+" : ""}${weightChange} מהפעם הקודמת` : "אין נתונים קודמים"} color="green" />
        <StatCard icon={<Camera className="w-5 h-5 text-purple-400" />} label="תמונות" value={totalPhotos.toString()} sub="לפני/אחרי" color="purple" />
      </div>

      {/* Weekly Report */}
      {totalWorkouts > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> דוח שבועי
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{weekWorkouts}</p>
              <p className="text-xs text-gray-500">אימונים השבוע</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgWorkoutsPerWeek}</p>
              <p className="text-xs text-gray-500">ממוצע שבועי</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{streak > 0 ? streak : "—"}</p>
              <p className="text-xs text-gray-500">ימי רצף</p>
            </div>
          </div>
          {latestBodyStat?.weight && firstBodyStat?.weight && firstBodyStat.id !== latestBodyStat.id && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
              <span className="text-gray-500">שינוי משקל מההתחלה</span>
              <span className={`font-bold ${weightLost && weightLost > 0 ? "text-green-400" : "text-red-400"}`}>
                {weightLost !== null ? `${weightLost > 0 ? "-" : "+"}${Math.abs(weightLost).toFixed(1)} ק"ג` : "—"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> הישגים ({earnedAchievements.length}/{achievements.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className={`rounded-xl p-3 text-center transition-all ${a.earned ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-gray-800/50 border border-gray-700/50 opacity-40"}`}>
                <p className="text-2xl mb-1">{a.icon}</p>
                <p className={`text-xs font-semibold ${a.earned ? "text-yellow-300" : "text-gray-500"}`}>{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">פעולות מהירות</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/workouts/new" icon={<Dumbbell className="w-5 h-5" />} label="רשום אימון" color="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400" />
          <QuickAction href="/body-stats/new" icon={<Scale className="w-5 h-5" />} label="עדכן מדדים" color="bg-green-500/10 hover:bg-green-500/20 text-green-400" />
          <QuickAction href="/photos/new" icon={<Camera className="w-5 h-5" />} label="הוסף תמונה" color="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400" />
          <QuickAction href="/ai" icon={<Brain className="w-5 h-5" />} label="ניתוח AI" color="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400" />
        </div>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">אימונים אחרונים</h2>
          <Link href="/workouts" className="text-orange-400 hover:text-orange-300 text-sm">הכל ←</Link>
        </div>
        {lastWorkouts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <Dumbbell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">אין אימונים עדיין</p>
            <Link href="/workouts/new" className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">רשום אימון</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lastWorkouts.map((workout) => (
              <Link key={workout.id} href={`/workouts/${workout.id}`} className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg"><Dumbbell className="w-4 h-4 text-orange-400" /></div>
                  <div>
                    <p className="font-medium text-white">{workout.name}</p>
                    <p className="text-xs text-gray-500">{workout.exercises.length} תרגילים{workout.duration ? ` · ${workout.duration} דקות` : ""}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{format(new Date(workout.date), "d/M")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalWorkouts > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-sm text-gray-300">
            סה&quot;כ אימנת <span className="text-orange-400 font-bold">{totalWorkouts}</span> פעמים.{" "}
            <Link href="/ai" className="text-orange-400 underline underline-offset-2">קבל ניתוח AI ←</Link>
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  const borders: Record<string, string> = { orange: "border-orange-500/20", blue: "border-blue-500/20", green: "border-green-500/20", purple: "border-purple-500/20" };
  return (
    <div className={`bg-gray-900 border ${borders[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${color} rounded-xl px-4 py-3 text-sm font-medium transition-colors`}>
      {icon}{label}
    </Link>
  );
}
