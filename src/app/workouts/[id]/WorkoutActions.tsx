"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, BookmarkPlus, Check } from "lucide-react";

interface Props {
  workoutId: string;
  workoutName: string;
  exercises: { name: string; sets: number; reps: number; weight: number | null }[];
}

export default function WorkoutActions({ workoutId, workoutName, exercises }: Props) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const copyWorkout = async () => {
    setCopying(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}/copy`, { method: "POST" });
      const data = await res.json();
      router.push(`/workouts/${data.id}`);
    } finally {
      setCopying(false);
    }
  };

  const saveAsTemplate = async () => {
    setSaving(true);
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workoutName, exercises }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={copyWorkout}
        disabled={copying}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        <Copy className="w-4 h-4" />
        {copying ? "מעתיק..." : "חזור על האימון"}
      </button>
      <button
        onClick={saveAsTemplate}
        disabled={saving || saved}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        {saved ? <><Check className="w-4 h-4 text-green-400" />נשמר!</> : <><BookmarkPlus className="w-4 h-4" />{saving ? "שומר..." : "שמור כתבנית"}</>}
      </button>
    </div>
  );
}
