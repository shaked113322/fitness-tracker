import { prisma } from "@/lib/prisma";
import { askFitnessQuestion } from "@/lib/gemini";
import { NextRequest } from "next/server";
import { subDays } from "date-fns";

export async function POST(request: NextRequest) {
  const { question } = await request.json();
  if (!question) return Response.json({ error: "No question" }, { status: 400 });

  const [totalWorkouts, recentWorkouts, latestStat] = await Promise.all([
    prisma.workout.count(),
    prisma.workout.count({ where: { date: { gte: subDays(new Date(), 30) } } }),
    prisma.bodyStat.findFirst({ orderBy: { date: "desc" } }),
  ]);

  const answer = await askFitnessQuestion(question, {
    totalWorkouts,
    recentWorkouts,
    avgWeight: latestStat?.weight ?? undefined,
  });

  return Response.json({ answer });
}
