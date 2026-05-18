import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { workouts: true, bodyStats: true, photos: true } } },
  });

  const rows = [
    ["ID", "Username", "Email", "Admin", "Banned", "Workouts", "Body Stats", "Photos", "Joined"].join(","),
    ...users.map((u) =>
      [
        u.id,
        `"${u.username}"`,
        `"${u.email}"`,
        u.isAdmin ? "Yes" : "No",
        u.banned ? "Yes" : "No",
        u._count.workouts,
        u._count.bodyStats,
        u._count.photos,
        format(new Date(u.createdAt), "yyyy-MM-dd"),
      ].join(",")
    ),
  ].join("\n");

  return new Response(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  });
}
