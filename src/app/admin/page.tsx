export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Users, Dumbbell, Scale, Camera, Shield } from "lucide-react";
import Link from "next/link";
import DeleteUserButton from "./DeleteUserButton";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { workouts: true, bodyStats: true, photos: true } },
    },
  });

  const totalWorkouts = users.reduce((s, u) => s + u._count.workouts, 0);
  const totalStats = users.reduce((s, u) => s + u._count.bodyStats, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-500/20 p-2 rounded-xl">
          <Shield className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">לוח בקרה — Admin</h1>
          <p className="text-gray-500 text-sm">ניהול כל המשתמשים</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Users className="w-5 h-5 text-blue-400" />} label="משתמשים" value={users.length} color="blue" />
        <SummaryCard icon={<Dumbbell className="w-5 h-5 text-orange-400" />} label="אימונים סה״כ" value={totalWorkouts} color="orange" />
        <SummaryCard icon={<Scale className="w-5 h-5 text-green-400" />} label="מדידות סה״כ" value={totalStats} color="green" />
        <SummaryCard icon={<Camera className="w-5 h-5 text-purple-400" />} label="תמונות סה״כ" value={users.reduce((s, u) => s + u._count.photos, 0)} color="purple" />
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-white">כל המשתמשים</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors group">
              <Link href={`/admin/users/${user.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{user.username}</p>
                    {user.isAdmin && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                <span className="hidden sm:flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" /> {user._count.workouts}
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> {user._count.bodyStats}
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> {user._count.photos}
                </span>
                <span className="hidden md:block text-gray-600 group-hover:text-gray-400 transition-colors">
                  {format(new Date(user.createdAt), "d/M/yy")}
                </span>
                {!user.isAdmin && <DeleteUserButton userId={user.id} username={user.username} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const borders: Record<string, string> = { blue: "border-blue-500/20", orange: "border-orange-500/20", green: "border-green-500/20", purple: "border-purple-500/20" };
  return (
    <div className={`bg-gray-900 border ${borders[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
