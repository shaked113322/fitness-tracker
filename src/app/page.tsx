export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Dumbbell, TrendingUp, Scale, Camera, Brain, Plus, Flame } from "lucide-react";
import Link from "next/link";
import { format, subDays } from "date-fns";

async function getDashboardData() {
  const [totalWorkouts, recentWorkouts, latestBodyStat, previousBodyStat, totalPhotos] = await Promise.all([
    prisma.workout.count(),
    prisma.workout.count({ where: { date: { gte: subDays(new Date(), 30) } } }),
    prisma.bodyStat.findFirst({ orderBy: { date: "desc" } }),
    prisma.bodyStat.findFirst({ orderBy: { date: "desc" }, skip: 1 }),
    prisma.photo.count(),
  ]);

  const lastWorkouts = await prisma.workout.findMany({
    take: 5,
    orderBy: { date: "desc" },
    include: { exercises: true },
  });

  return { totalWorkouts, recentWorkouts, latestBodyStat, previousBodyStat, totalPhotos, lastWorkouts };
}

export default async function Dashboard() {
  const { totalWorkouts, recentWorkouts, latestBodyStat, previousBodyStat, totalPhotos, lastWorkouts } =
    await getDashboardData();

  const weightChange =
    latestBodyStat?.weight && previousBodyStat?.weight
      ? (latestBodyStat.weight - previousBodyStat.weight).toFixed(1)
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">שלום! 💪</h1>
          <p className="text-gray-400 text-sm mt-1">
            {format(new Date(), "EEEE, d בMMMM yyyy")}
          </p>
        </div>
        <Link
          href="/workouts/new"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          אימון חדש
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="אימונים השבועות"
          value={recentWorkouts.toString()}
          sub="ב-30 ימים אחרונים"
          color="orange"
        />
        <StatCard
          icon={<Dumbbell className="w-5 h-5 text-blue-400" />}
          label="סה&quot;כ אימונים"
          value={totalWorkouts.toString()}
          sub="מהתחלה"
          color="blue"
        />
        <StatCard
          icon={<Scale className="w-5 h-5 text-green-400" />}
          label="משקל נוכחי"
          value={latestBodyStat?.weight ? `${latestBodyStat.weight} ק"ג` : "—"}
          sub={weightChange ? `${Number(weightChange) > 0 ? "+" : ""}${weightChange} מהפעם הקודמת` : "אין נתונים קודמים"}
          color="green"
        />
        <StatCard
          icon={<Camera className="w-5 h-5 text-purple-400" />}
          label="תמונות"
          value={totalPhotos.toString()}
          sub="לפני/אחרי"
          color="purple"
        />
      </div>

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
          <Link href="/workouts" className="text-orange-400 hover:text-orange-300 text-sm">
            הכל ←
          </Link>
        </div>

        {lastWorkouts.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-8 h-8 text-gray-600" />}
            title="אין אימונים עדיין"
            desc="התחל לרשום את האימון הראשון שלך"
            href="/workouts/new"
            cta="רשום אימון"
          />
        ) : (
          <div className="space-y-3">
            {lastWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workouts/${workout.id}`}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg">
                    <Dumbbell className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{workout.name}</p>
                    <p className="text-xs text-gray-500">
                      {workout.exercises.length} תרגילים
                      {workout.duration ? ` · ${workout.duration} דקות` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(workout.date), "d/M")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Progress Hint */}
      {totalWorkouts > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-sm text-gray-300">
            סה&quot;כ אימנת <span className="text-orange-400 font-bold">{totalWorkouts}</span> פעמים.{" "}
            <Link href="/ai" className="text-orange-400 underline underline-offset-2">
              קבל ניתוח AI של ההתקדמות שלך ←
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const borders: Record<string, string> = {
    orange: "border-orange-500/20",
    blue: "border-blue-500/20",
    green: "border-green-500/20",
    purple: "border-purple-500/20",
  };
  return (
    <div className={`bg-gray-900 border ${borders[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 ${color} rounded-xl px-4 py-3 text-sm font-medium transition-colors`}
    >
      {icon}
      {label}
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-gray-400 font-medium">{title}</p>
      <p className="text-gray-600 text-sm mt-1">{desc}</p>
      <Link
        href={href}
        className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {cta}
      </Link>
    </div>
  );
}
