import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { identifier, password } = await request.json();

  if (!identifier || !password) {
    return Response.json({ error: "כל השדות הם חובה" }, { status: 400 });
  }

  // Support login with email OR username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier },
      ],
    },
  });

  if (!user) {
    return Response.json({ error: "אימייל/שם משתמש או סיסמה שגויים" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "אימייל/שם משתמש או סיסמה שגויים" }, { status: 401 });
  }

  await createSession({ id: user.id, email: user.email, username: user.username, isAdmin: user.isAdmin });

  return Response.json({ success: true });
}
