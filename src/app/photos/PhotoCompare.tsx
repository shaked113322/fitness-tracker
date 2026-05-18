"use client";

import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeftRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  date: Date;
  description: string | null;
}

export default function PhotoCompare({ first, last }: { first: Photo; last: Photo }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4 text-orange-400" /> השוואה: לפני ואחרי
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-center text-gray-500 mb-2">לפני · {format(new Date(first.date), "d/M/yyyy")}</p>
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-700">
            <Image src={first.url} alt="לפני" fill className="object-cover" />
          </div>
          {first.description && <p className="text-xs text-gray-400 text-center mt-2">{first.description}</p>}
        </div>
        <div>
          <p className="text-xs text-center text-gray-500 mb-2">אחרי · {format(new Date(last.date), "d/M/yyyy")}</p>
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-orange-500/30">
            <Image src={last.url} alt="אחרי" fill className="object-cover" />
          </div>
          {last.description && <p className="text-xs text-gray-400 text-center mt-2">{last.description}</p>}
        </div>
      </div>
    </div>
  );
}
