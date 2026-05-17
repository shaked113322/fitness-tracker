import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { analyzeProgress } from "@/lib/gemini";
import { format } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [workouts, bodyStats] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: session.id },
      orderBy: { date: "desc" },
      take: 20,
      include: { exercises: true },
    }),
    prisma.bodyStat.findMany({
      where: { userId: session.id },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  if (workouts.length === 0 && bodyStats.length === 0) {
    return Response.json({ analysis: "אין מספיק נתונים לניתוח עדיין. הוסף אימונים ומדדים כדי לקבל תובנות." });
  }

  try {
    const analysis = await analyzeProgress({
      workouts: workouts.map((w) => ({
        date: format(new Date(w.date), "dd/MM/yyyy"),
        name: w.name,
        exercises: w.exercises.map((e) => ({
          name: e.name, sets: e.sets, reps: e.reps, weight: e.weight,
        })),
      })),
      bodyStats: bodyStats.map((s) => ({
        date: format(new Date(s.date), "dd/MM/yyyy"),
        weight: s.weight, chest: s.chest, waist: s.waist,
        hips: s.hips, arms: s.arms, legs: s.legs, bodyFat: s.bodyFat,
      })),
    });
    return Response.json({ analysis });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      return Response.json({ analysis: "מכסת ה-AI הגיעה לגבול. נסה שוב מאוחר יותר." });
    }
    return Response.json({ analysis: "שגיאה בשירות ה-AI. נסה שוב." });
  }
}
