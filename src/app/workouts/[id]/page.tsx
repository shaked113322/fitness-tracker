export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell, Clock, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteWorkoutButton from "./DeleteWorkoutButton";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({
    where: { id },
    include: { exercises: true },
  });

  if (!workout) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/workouts" className="text-gray-500 hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span>{format(new Date(workout.date), "d בMMMM yyyy, HH:mm")}</span>
        {workout.duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {workout.duration} דקות
          </span>
        )}
        <span>{workout.exercises.length} תרגילים</span>
      </div>

      {workout.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-gray-400 text-sm">
          {workout.notes}
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-3">
        <h2 className="font-semibold text-white">תרגילים</h2>
        {workout.exercises.map((exercise, idx) => (
          <div key={exercise.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500/20 w-7 h-7 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">
                {idx + 1}
              </div>
              <p className="font-semibold text-white">{exercise.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{exercise.sets}</p>
                <p className="text-xs text-gray-500">סטים</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{exercise.reps}</p>
                <p className="text-xs text-gray-500">חזרות</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">
                  {exercise.weight ? exercise.weight : "—"}
                </p>
                <p className="text-xs text-gray-500">ק&quot;ג</p>
              </div>
            </div>
            {exercise.notes && (
              <p className="mt-2 text-xs text-gray-500">{exercise.notes}</p>
            )}
          </div>
        ))}
      </div>

      <DeleteWorkoutButton workoutId={workout.id} />
    </div>
  );
}
