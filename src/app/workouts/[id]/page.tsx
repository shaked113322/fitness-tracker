export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell, Clock, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import DeleteWorkoutButton from "./DeleteWorkoutButton";
import WorkoutActions from "./WorkoutActions";

async function getPRs(userId: string, exercises: { name: string; weight: number | null; sets: number; reps: number }[]) {
  const prMap: Record<string, boolean> = {};
  for (const ex of exercises) {
    if (!ex.weight) continue;
    const best = await prisma.exercise.findFirst({
      where: { workout: { userId }, name: { equals: ex.name, mode: "insensitive" }, weight: { gt: ex.weight } },
      orderBy: { weight: "desc" },
    });
    if (!best) prMap[ex.name] = true;
  }
  return prMap;
}

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session!.id },
    include: { exercises: true },
  });
  if (!workout) notFound();

  const prs = await getPRs(session!.id, workout.exercises);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/workouts" className="text-gray-500 hover:text-white transition-colors"><ArrowRight className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white flex-1">{workout.name}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span>{format(new Date(workout.date), "d בMMMM yyyy, HH:mm")}</span>
        {workout.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{workout.duration} דקות</span>}
        <span>{workout.exercises.length} תרגילים</span>
      </div>

      {workout.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-gray-400 text-sm">{workout.notes}</div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold text-white">תרגילים</h2>
        {workout.exercises.map((exercise, idx) => (
          <div key={exercise.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500/20 w-7 h-7 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">{idx + 1}</div>
              <p className="font-semibold text-white flex-1">{exercise.name}</p>
              {prs[exercise.name] && exercise.weight && (
                <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  <Trophy className="w-3 h-3" />שיא אישי!
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center"><p className="text-2xl font-bold text-orange-400">{exercise.sets}</p><p className="text-xs text-gray-500">סטים</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-orange-400">{exercise.reps}</p><p className="text-xs text-gray-500">חזרות</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-orange-400">{exercise.weight ?? "—"}</p><p className="text-xs text-gray-500">ק&quot;ג</p></div>
            </div>
          </div>
        ))}
      </div>

      <WorkoutActions workoutId={workout.id} workoutName={workout.name} exercises={workout.exercises.map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, weight: e.weight }))} />
      <DeleteWorkoutButton workoutId={workout.id} />
    </div>
  );
}
