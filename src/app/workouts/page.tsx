export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Dumbbell, Plus, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function WorkoutsPage() {
  const workouts = await prisma.workout.findMany({
    orderBy: { date: "desc" },
    include: { exercises: true },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">יומן אימונים</h1>
        <Link
          href="/workouts/new"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          אימון חדש
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">אין אימונים עדיין</p>
          <p className="text-gray-600 text-sm mt-1">התחל לרשום את האימון הראשון שלך!</p>
          <Link
            href="/workouts/new"
            className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            רשום אימון ראשון
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-4 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/20 p-2.5 rounded-xl">
                  <Dumbbell className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{workout.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {workout.exercises.length} תרגילים
                    </span>
                    {workout.duration && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {workout.duration} דקות
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {format(new Date(workout.date), "d/M/yyyy")}
                </span>
                <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
