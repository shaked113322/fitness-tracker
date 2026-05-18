import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import { hash as bcryptHash } from "@node-rs/bcrypt";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { workouts: true, bodyStats: true, photos: true } },
      workouts: { orderBy: { date: "desc" }, take: 10, include: { exercises: true } },
      bodyStats: { orderBy: { date: "desc" }, take: 1 },
    },
  });
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (id === session.id) return Response.json({ error: "לא ניתן לערוך את עצמך" }, { status: 400 });

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.banned === "boolean") update.banned = body.banned;
  if (typeof body.isAdmin === "boolean") update.isAdmin = body.isAdmin;
  if (body.newPassword) {
    if (body.newPassword.length < 6) return Response.json({ error: "סיסמה קצרה מדי" }, { status: 400 });
    update.password = await bcryptHash(body.newPassword, 10);
  }

  if (Object.keys(update).length === 0) return Response.json({ error: "אין מה לעדכן" }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data: update });
  return Response.json({ success: true, banned: user.banned, isAdmin: user.isAdmin });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (id === session.id) return Response.json({ error: "לא ניתן למחוק את החשבון שלך" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return Response.json({ success: true });
}
