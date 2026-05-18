import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.workout.findFirst({
    where: { id, userId: session.id },
    include: { exercises: true },
  });
  if (!original) return Response.json({ error: "Not found" }, { status: 404 });

  const copy = await prisma.workout.create({
    data: {
      userId: session.id,
      name: original.name,
      duration: original.duration,
      notes: original.notes,
      exercises: {
        create: original.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          notes: e.notes,
        })),
      },
    },
  });
  return Response.json({ id: copy.id }, { status: 201 });
}
