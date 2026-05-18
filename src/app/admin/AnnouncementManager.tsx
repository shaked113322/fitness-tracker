"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Send, X, Check } from "lucide-react";

const COLORS = [
  { value: "orange", label: "כתום", cls: "bg-orange-500" },
  { value: "blue", label: "כחול", cls: "bg-blue-500" },
  { value: "green", label: "ירוק", cls: "bg-green-500" },
  { value: "red", label: "אדום", cls: "bg-red-500" },
  { value: "yellow", label: "צהוב", cls: "bg-yellow-500" },
];

interface Ann { id: string; message: string; color: string }

export default function AnnouncementManager({ activeAnnouncement }: { activeAnnouncement: Ann | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("orange");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [done, setDone] = useState(false);

  const publish = async () => {
    if (!message.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, color }),
      });
      setMessage("");
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await fetch("/api/admin/announcement", { method: "DELETE" });
      router.refresh();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-white flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-yellow-400" /> הודעת מערכת לכל המשתמשים
      </h2>

      {activeAnnouncement && (
        <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">הודעה פעילה כעת:</p>
            <p className="text-white text-sm">{activeAnnouncement.message}</p>
          </div>
          <button
            onClick={remove}
            disabled={removing}
            className="text-gray-500 hover:text-red-400 transition-colors mr-3 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="כתוב הודעה לכל המשתמשים..."
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">צבע:</span>
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-5 h-5 rounded-full ${c.cls} transition-transform ${color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110" : ""}`}
                title={c.label}
              />
            ))}
          </div>
          <button
            onClick={publish}
            disabled={saving || !message.trim()}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            {done ? <><Check className="w-4 h-4" />פורסם!</> : <><Send className="w-4 h-4" />{saving ? "שולח..." : "פרסם הודעה"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
