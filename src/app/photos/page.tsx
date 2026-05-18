export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Camera, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import PhotoCompare from "./PhotoCompare";

export default async function PhotosPage() {
  const session = await getSession();
  const photos = await prisma.photo.findMany({
    where: { userId: session!.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">תמונות התקדמות</h1>
        <Link href="/photos/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />הוסף תמונה
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Camera className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">אין תמונות עדיין</p>
          <Link href="/photos/new" className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">הוסף תמונה ראשונה</Link>
        </div>
      ) : (
        <>
          {photos.length >= 2 && (
            <PhotoCompare
              first={photos[photos.length - 1]}
              last={photos[0]}
            />
          )}

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">כל התמונות</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="relative aspect-[3/4]">
                    <Image src={photo.url} alt={photo.description || "תמונת התקדמות"} fill className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500">{format(new Date(photo.date), "d בMMMM yyyy")}</p>
                    {photo.description && <p className="text-sm text-gray-300 mt-1">{photo.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
