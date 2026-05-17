"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteUserButton({ userId, username, redirectTo }: { userId: string; username: string; redirectTo?: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirm(false);
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <span className="text-xs text-red-400">למחוק את {username}?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition-colors"
        >
          {deleting ? "מוחק..." : "כן"}
        </button>
        <button onClick={handleCancel} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded-lg transition-colors">
          ביטול
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
      title="מחק משתמש"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
