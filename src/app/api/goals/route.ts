import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({ where: { userId: session.id } });
  return Response.json(goals);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { metric, target } = await request.json();
  if (!metric || target == null) return Response.json({ error: "חסרים פרטים" }, { status: 400 });

  const goal = await prisma.goal.upsert({
    where: { userId_metric: { userId: session.id, metric } },
    update: { target },
    create: { userId: session.id, metric, target },
  });
  return Response.json(goal);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { metric } = await request.json();
  await prisma.goal.deleteMany({ where: { userId: session.id, metric } });
  return Response.json({ success: true });
}
