import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (id === session.id) {
    return Response.json({ error: "לא ניתן למחוק את החשבון שלך" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return Response.json({ success: true });
}
