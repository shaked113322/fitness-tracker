import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { hash as bcryptHash } from "@node-rs/bcrypt";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, username, password } = await request.json();

  if (!email || !username || !password) {
    return Response.json({ error: "כל השדות הם חובה" }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] },
  });

  if (existing) {
    if (existing.email === normalizedEmail) {
      return Response.json({ error: "האימייל כבר קיים במערכת" }, { status: 409 });
    }
    return Response.json({ error: "שם המשתמש כבר תפוס" }, { status: 409 });
  }

  const hashed = await bcryptHash(password, 10);

  const user = await prisma.user.create({
    data: { email: normalizedEmail, username: normalizedUsername, password: hashed },
  });

  await createSession({ id: user.id, email: user.email, username: user.username, isAdmin: user.isAdmin });

  return Response.json({ success: true }, { status: 201 });
}
