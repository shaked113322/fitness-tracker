"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Unlock, KeyRound, Check, AlertCircle, LockOpen } from "lucide-react";

export default function UserAdminActions({
  userId, username, banned, isAdmin, lockedUntil,
}: {
  userId: string; username: string; banned: boolean; isAdmin: boolean; lockedUntil: Date | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const isLocked = lockedUntil && new Date(lockedUntil) > new Date();

  const action = async (body: Record<string, unknown>, label: string) => {
    setLoading(label);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "err", text: data.error }); return; }
      setMessage({ type: "ok", text: "הפעולה בוצעה בהצלחה" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "err", text: "סיסמה חייבת להכיל לפחות 6 תווים" });
      return;
    }
    await action({ newPassword }, "password");
    setNewPassword("");
    setShowPasswordForm(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-white">פעולות ניהול עבור {username}</h2>

      {isLocked && (
        <div className="flex items-center gap-2 text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          חשבון נעול זמנית (יותר מדי ניסיונות כניסה כושלים)
        </div>
      )}

      {message && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${message.type === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {message.type === "ok" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Ban / Unban */}
        <button
          onClick={() => action({ banned: !banned }, "ban")}
          disabled={loading !== null}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            banned
              ? "bg-green-500/10 hover:bg-green-500/20 text-green-400"
              : "bg-red-500/10 hover:bg-red-500/20 text-red-400"
          }`}
        >
          {banned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          {loading === "ban" ? "..." : banned ? "בטל חסימה" : "חסום משתמש"}
        </button>

        {/* Unlock locked account */}
        {isLocked && (
          <button
            onClick={() => action({ unlock: true }, "unlock")}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors"
          >
            <LockOpen className="w-4 h-4" />
            {loading === "unlock" ? "..." : "שחרר נעילה"}
          </button>
        )}

        {/* Reset password */}
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
        >
          <KeyRound className="w-4 h-4" />
          איפוס סיסמה
        </button>
      </div>

      {showPasswordForm && (
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="סיסמה חדשה (מינימום 6 תווים)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={resetPassword}
            disabled={loading === "password"}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading === "password" ? "..." : "שמור"}
          </button>
        </div>
      )}
    </div>
  );
}
