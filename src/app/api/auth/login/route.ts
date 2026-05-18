import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { verify as bcryptVerify } from "@node-rs/bcrypt";
import { NextRequest } from "next/server";

const MAX_ATTEMPTS = 10;
const LOCK_MINUTES = 15;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return Response.json({ error: "כל השדות הם חובה" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: "insensitive" } },
        { username: { equals: identifier, mode: "insensitive" } },
      ],
    },
  });

  if (!user) {
    // Generic error — don't reveal whether the user exists
    return Response.json({ error: "אימייל/שם משתמש או סיסמה שגויים" }, { status: 401 });
  }

  // Check ban
  if (user.banned) {
    return Response.json({ error: "החשבון שלך חסום. פנה לאדמין לקבלת עזרה." }, { status: 403 });
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return Response.json(
      { error: `החשבון נעול זמנית. נסה שוב בעוד ${minutesLeft} דקות.` },
      { status: 429 }
    );
  }

  const valid = await bcryptVerify(password, user.password);

  if (!valid) {
    const newAttempts = user.failedLoginAttempts + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
          : null,
      },
    });

    if (shouldLock) {
      return Response.json(
        { error: `יותר מדי ניסיונות כושלים. החשבון נעול ל-${LOCK_MINUTES} דקות.` },
        { status: 429 }
      );
    }

    const remaining = MAX_ATTEMPTS - newAttempts;
    return Response.json(
      { error: `סיסמה שגויה. נותרו ${remaining} ניסיונות לפני נעילה.` },
      { status: 401 }
    );
  }

  // Success — reset lockout counters
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await createSession({ id: user.id, email: user.email, username: user.username, isAdmin: user.isAdmin });

  return Response.json({ success: true });
}
