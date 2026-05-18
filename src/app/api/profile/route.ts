import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { username, currentPassword, newPassword } = await request.json();

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const updateData: Record<string, string> = {};

  if (username && username !== user.username) {
    const taken = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" }, NOT: { id: session.id } },
    });
    if (taken) return Response.json({ error: "שם המשתמש כבר תפוס" }, { status: 409 });
    updateData.username = username.trim().toLowerCase();
  }

  if (newPassword) {
    if (!currentPassword) return Response.json({ error: "נדרשת סיסמה נוכחית" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return Response.json({ error: "הסיסמה הנוכחית שגויה" }, { status: 401 });
    if (newPassword.length < 6) return Response.json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" }, { status: 400 });
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: "אין מה לעדכן" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id: session.id }, data: updateData });

  // Refresh session with new username
  await createSession({ id: updated.id, email: updated.email, username: updated.username, isAdmin: updated.isAdmin });

  return Response.json({ success: true, username: updated.username });
}
