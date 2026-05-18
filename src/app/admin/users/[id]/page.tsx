export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowRight, Dumbbell, Scale, Camera, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteUserButton from "../../DeleteUserButton";
import UserAdminActions from "./UserAdminActions";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      workouts: { orderBy: { date: "desc" }, include: { exercises: true } },
      bodyStats: { orderBy: { date: "desc" } },
      photos: { orderBy: { date: "desc" } },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{user.username}</h1>
            {user.isAdmin && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" />Admin</span>}
            {user.banned && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">חסום</span>}
          </div>
          <p className="text-sm text-gray-500">{user.email} · נרשם {format(new Date(user.createdAt), "d/M/yyyy")}</p>
        </div>
      </div>

      {/* Admin Actions */}
      {!user.isAdmin && (
        <UserAdminActions
          userId={user.id}
          username={user.username}
          banned={user.banned}
          isAdmin={user.isAdmin}
          lockedUntil={user.lockedUntil}
        />
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-4 text-center">
          <Dumbbell className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{user.workouts.length}</p>
          <p className="text-xs text-gray-500">אימונים</p>
        </div>
        <div className="bg-gray-900 border border-green-500/20 rounded-xl p-4 text-center">
          <Scale className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{user.bodyStats.length}</p>
          <p className="text-xs text-gray-500">מדידות</p>
        </div>
        <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-4 text-center">
          <Camera className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{user.photos.length}</p>
          <p className="text-xs text-gray-500">תמונות</p>
        </div>
      </div>

      {/* Latest Body Stat */}
      {user.bodyStats[0] && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-green-400" /> מדד אחרון — {format(new Date(user.bodyStats[0].date), "d/M/yyyy")}
          </h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {user.bodyStats[0].weight && <Stat label='משקל' value={`${user.bodyStats[0].weight} ק"ג`} />}
            {user.bodyStats[0].chest && <Stat label='חזה' value={`${user.bodyStats[0].chest} ס"מ`} />}
            {user.bodyStats[0].waist && <Stat label='מותן' value={`${user.bodyStats[0].waist} ס"מ`} />}
            {user.bodyStats[0].hips && <Stat label='ירך' value={`${user.bodyStats[0].hips} ס"מ`} />}
            {user.bodyStats[0].arms && <Stat label='זרועות' value={`${user.bodyStats[0].arms} ס"מ`} />}
            {user.bodyStats[0].bodyFat && <Stat label='שומן' value={`${user.bodyStats[0].bodyFat}%`} />}
          </div>
        </div>
      )}

      {/* Workouts */}
      {user.workouts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" /> אימונים אחרונים
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {user.workouts.slice(0, 10).map((w) => (
              <div key={w.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{w.name}</p>
                  <p className="text-xs text-gray-500">{w.exercises.length} תרגילים{w.duration ? ` · ${w.duration} דקות` : ""}</p>
                </div>
                <span className="text-sm text-gray-500">{format(new Date(w.date), "d/M/yy")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {user.photos.length > 0 && (
        <div>
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" /> תמונות
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {user.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-800">
                <Image src={photo.url} alt={photo.description || ""} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {!user.isAdmin && (
        <div className="border border-red-500/20 rounded-xl p-5">
          <h2 className="font-semibold text-red-400 mb-3">אזור מסוכן</h2>
          <DeleteUserButton userId={user.id} username={user.username} redirectTo="/admin" />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-white">{value}</p>
    </div>
  );
}
