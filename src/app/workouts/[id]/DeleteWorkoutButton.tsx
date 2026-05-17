"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteWorkoutButton({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("למחוק את האימון? פעולה זו לא ניתנת לביטול.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/workouts/${workoutId}`, { method: "DELETE" });
      router.push("/workouts");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {deleting ? "מוחק..." : "מחק אימון"}
    </button>
  );
}
