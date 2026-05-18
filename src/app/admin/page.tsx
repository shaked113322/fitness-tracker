export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import { Users, Dumbbell, Scale, Camera, Shield, Trophy, TrendingUp, BarChart2 } from "lucide-react";
import Link from "next/link";
import DeleteUserButton from "./DeleteUserButton";
import AdminStatsCharts from "./AdminStatsCharts";
import AnnouncementManager from "./AnnouncementManager";

async function getAdminData() {
  const thirtyDaysAgo = subDays(new Date(), 29);
  const sevenDaysAgo = subDays(new Date(), 6);

  const [users, totalWorkoutsAll, weekWorkouts, newUsersMonth, allExercises, activeAnnouncement] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { workouts: true, bodyStats: true, photos: true } } },
    }),
    prisma.workout.count(),
    prisma.workout.count({ where: { date: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.exercise.findMany({ select: { name: true } }),
    prisma.announcement.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }),
  ]);

  // Leaderboard: top 5 users by workout count
  const leaderboard = [...users]
    .sort((a, b) => b._count.workouts - a._count.workouts)
    .slice(0, 5);

  // Popular exercises top 8
  const counts: Record<string, number> = {};
  for (const e of allExercises) {
    const n = e.name.trim();
    counts[n] = (counts[n] || 0) + 1;
  }
  const popularExercises = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return { users, totalWorkoutsAll, weekWorkouts, newUsersMonth, leaderboard, popularExercises, activeAnnouncement };
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/");

  const { users, totalWorkoutsAll, weekWorkouts, newUsersMonth, leaderboard, popularExercises, activeAnnouncement } = await getAdminData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-yellow-500/20 p-2 rounded-xl">
          <Shield className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">לוח בקרה — Admin</h1>
          <p className="text-gray-500 text-sm">ניהול כל המשתמשים והאתר</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Users className="w-5 h-5 text-blue-400" />} label="משתמשים" value={users.length} sub={`+${newUsersMonth} החודש`} color="blue" />
        <SummaryCard icon={<Dumbbell className="w-5 h-5 text-orange-400" />} label='אימונים סה"כ' value={totalWorkoutsAll} sub={`${weekWorkouts} השבוע`} color="orange" />
        <SummaryCard icon={<Scale className="w-5 h-5 text-green-400" />} label='מדידות סה"כ' value={users.reduce((s, u) => s + u._count.bodyStats, 0)} sub="כל המשתמשים" color="green" />
        <SummaryCard icon={<Camera className="w-5 h-5 text-purple-400" />} label="תמונות" value={users.reduce((s, u) => s + u._count.photos, 0)} sub="כל המשתמשים" color="purple" />
      </div>

      {/* Activity Charts */}
      <AdminStatsCharts />

      {/* Leaderboard + Popular Exercises */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> לידרבורד — המשתמשים הכי פעילים
          </h2>
          <div className="space-y-2">
            {leaderboard.map((u, i) => (
              <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors">
                <span className={`w-6 text-sm font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-600"}`}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <span className="flex-1 text-white text-sm">{u.username}</span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" />{u._count.workouts}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Exercises */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" /> תרגילים הכי פופולריים
          </h2>
          <div className="space-y-2">
            {popularExercises.map(([name, count], i) => {
              const maxCount = popularExercises[0][1];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300">{i + 1}. {name}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Announcement Manager */}
      <AnnouncementManager activeAnnouncement={activeAnnouncement ? { id: activeAnnouncement.id, message: activeAnnouncement.message, color: activeAnnouncement.color } : null} />

      {/* Users Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-white">כל המשתמשים ({users.length})</h2>
          </div>
          <a
            href="/api/admin/export"
            className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />ייצוא CSV
          </a>
        </div>
        <div className="divide-y divide-gray-800">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors group">
              <Link href={`/admin/users/${user.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{user.username}</p>
                    {user.isAdmin && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Admin</span>}
                    {user.banned && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">חסום</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                <span className="hidden sm:flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" /> {user._count.workouts}</span>
                <span className="hidden sm:flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> {user._count.bodyStats}</span>
                <span className="hidden md:block text-gray-600">{format(new Date(user.createdAt), "d/M/yy")}</span>
                {!user.isAdmin && <DeleteUserButton userId={user.id} username={user.username} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number; sub: string; color: string }) {
  const borders: Record<string, string> = { blue: "border-blue-500/20", orange: "border-orange-500/20", green: "border-green-500/20", purple: "border-purple-500/20" };
  return (
    <div className={`bg-gray-900 border ${borders[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
