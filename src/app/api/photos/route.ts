import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { date: "desc" } });
  return Response.json(photos);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const description = formData.get("description") as string;

  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const blob = await put(`photos/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      description: description || null,
    },
  });

  return Response.json(photo, { status: 201 });
}
