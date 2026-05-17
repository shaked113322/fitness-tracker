import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const workouts = await prisma.workout.findMany({
    where: { userId: session.id },
    orderBy: { date: "desc" },
    include: { exercises: true },
  });
  return Response.json(workouts);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, duration, notes, exercises } = await request.json();

  const workout = await prisma.workout.create({
    data: {
      userId: session.id,
      name,
      duration: duration ?? null,
      notes: notes ?? null,
      exercises: {
        create: exercises.map((ex: { name: string; sets: number; reps: number; weight: string; notes: string }) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ? parseFloat(ex.weight) : null,
          notes: ex.notes || null,
        })),
      },
    },
    include: { exercises: true },
  });

  return Response.json(workout, { status: 201 });
}
