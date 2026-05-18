import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const active = await prisma.announcement.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } });
  return Response.json(active);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { message, color } = await req.json();
  if (!message?.trim()) return Response.json({ error: "חסר תוכן" }, { status: 400 });

  await prisma.announcement.updateMany({ where: { active: true }, data: { active: false } });
  const ann = await prisma.announcement.create({ data: { message: message.trim(), color: color || "orange", active: true } });
  return Response.json(ann);
}

export async function DELETE() {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.announcement.updateMany({ where: { active: true }, data: { active: false } });
  return Response.json({ success: true });
}
