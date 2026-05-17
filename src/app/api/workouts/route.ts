import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const workouts = await prisma.workout.findMany({
    orderBy: { date: "desc" },
    include: { exercises: true },
  });
  return Response.json(workouts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, duration, notes, exercises } = body;

  const workout = await prisma.workout.create({
    data: {
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
