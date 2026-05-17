import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({
    where: { id },
    include: { exercises: true },
  });
  if (!workout) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(workout);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.workout.delete({ where: { id } });
  return Response.json({ success: true });
}
