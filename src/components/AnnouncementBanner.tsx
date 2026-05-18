"use client";

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  color: string;
}

const COLOR_MAP: Record<string, string> = {
  orange: "bg-orange-500/15 border-orange-500/30 text-orange-300",
  blue: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  green: "bg-green-500/15 border-green-500/30 text-green-300",
  red: "bg-red-500/15 border-red-500/30 text-red-300",
  yellow: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
};

export default function AnnouncementBanner() {
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/announcement")
      .then((r) => r.json())
      .then((d) => { if (d?.id) setAnn(d); });
  }, []);

  if (!ann || dismissed === ann.id) return null;

  const colorClass = COLOR_MAP[ann.color] ?? COLOR_MAP.orange;

  return (
    <div className={`border-b ${colorClass} px-4 py-2.5 flex items-center gap-3`}>
      <Megaphone className="w-4 h-4 shrink-0" />
      <p className="flex-1 text-sm font-medium">{ann.message}</p>
      <button onClick={() => setDismissed(ann.id)} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
