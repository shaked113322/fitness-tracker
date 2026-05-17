import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await prisma.bodyStat.findMany({
    where: { userId: session.id },
    orderBy: { date: "desc" },
  });
  return Response.json(stats);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const stat = await prisma.bodyStat.create({
    data: { ...body, userId: session.id },
  });
  return Response.json(stat, { status: 201 });
}
