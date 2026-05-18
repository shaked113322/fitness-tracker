import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: session.id },
    include: { exercises: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(templates);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, exercises } = await request.json();
  if (!name) return Response.json({ error: "שם חסר" }, { status: 400 });

  const template = await prisma.workoutTemplate.create({
    data: {
      name,
      userId: session.id,
      exercises: {
        create: exercises.map((e: { name: string; sets: number; reps: number; weight?: number }, i: number) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight ?? null,
          order: i,
        })),
      },
    },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  return Response.json(template, { status: 201 });
}
