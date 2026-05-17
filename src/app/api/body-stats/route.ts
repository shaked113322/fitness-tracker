import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const stats = await prisma.bodyStat.findMany({ orderBy: { date: "desc" } });
  return Response.json(stats);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const stat = await prisma.bodyStat.create({ data: body });
  return Response.json(stat, { status: 201 });
}
