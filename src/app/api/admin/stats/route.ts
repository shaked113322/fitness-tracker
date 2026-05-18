import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { subDays, format, startOfDay } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const thirtyDaysAgo = subDays(new Date(), 29);

  const [workoutsLast30, usersLast30, allExercises, newUsersPerDay] = await Promise.all([
    prisma.workout.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { date: true },
      orderBy: { date: "asc" },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.exercise.findMany({ select: { name: true } }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Workouts per day (last 30)
  const workoutsByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    workoutsByDay[format(subDays(new Date(), i), "d/M")] = 0;
  }
  for (const w of workoutsLast30) {
    const key = format(new Date(w.date), "d/M");
    if (key in workoutsByDay) workoutsByDay[key]++;
  }

  // New users per day
  const usersByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    usersByDay[format(subDays(new Date(), i), "d/M")] = 0;
  }
  for (const u of newUsersPerDay) {
    const key = format(new Date(u.createdAt), "d/M");
    if (key in usersByDay) usersByDay[key]++;
  }

  // Popular exercises
  const exerciseCounts: Record<string, number> = {};
  for (const e of allExercises) {
    const name = e.name.trim();
    exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
  }
  const popularExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return Response.json({
    workoutsByDay: Object.entries(workoutsByDay).map(([date, count]) => ({ date, count })),
    usersByDay: Object.entries(usersByDay).map(([date, count]) => ({ date, count })),
    popularExercises,
  });
}
