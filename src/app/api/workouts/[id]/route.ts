import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.id },
    include: { exercises: true },
  });
  if (!workout) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(workout);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.workout.deleteMany({ where: { id, userId: session.id } });
  return Response.json({ success: true });
}
