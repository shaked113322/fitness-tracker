import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { askFitnessQuestion } from "@/lib/gemini";
import { NextRequest } from "next/server";
import { subDays } from "date-fns";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { question } = await request.json();
  if (!question) return Response.json({ error: "No question" }, { status: 400 });

  const [totalWorkouts, recentWorkouts, latestStat] = await Promise.all([
    prisma.workout.count({ where: { userId: session.id } }),
    prisma.workout.count({ where: { userId: session.id, date: { gte: subDays(new Date(), 30) } } }),
    prisma.bodyStat.findFirst({ where: { userId: session.id }, orderBy: { date: "desc" } }),
  ]);

  const answer = await askFitnessQuestion(question, {
    totalWorkouts,
    recentWorkouts,
    avgWeight: latestStat?.weight ?? undefined,
  });

  return Response.json({ answer });
}
