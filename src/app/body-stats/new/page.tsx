"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Save } from "lucide-react";

export default function NewBodyStatPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    weight: "", chest: "", waist: "", hips: "", arms: "", legs: "", bodyFat: "", notes: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/body-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: form.weight ? parseFloat(form.weight) : null,
          chest: form.chest ? parseFloat(form.chest) : null,
          waist: form.waist ? parseFloat(form.waist) : null,
          hips: form.hips ? parseFloat(form.hips) : null,
          arms: form.arms ? parseFloat(form.arms) : null,
          legs: form.legs ? parseFloat(form.legs) : null,
          bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : null,
          notes: form.notes || null,
        }),
      });
      router.push("/body-stats");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "weight", label: 'משקל (ק"ג)', placeholder: "75.5" },
    { key: "chest", label: 'חזה (ס"מ)', placeholder: "100" },
    { key: "waist", label: 'מותן (ס"מ)', placeholder: "80" },
    { key: "hips", label: 'ירך (ס"מ)', placeholder: "95" },
    { key: "arms", label: 'זרועות (ס"מ)', placeholder: "35" },
    { key: "legs", label: 'רגליים (ס"מ)', placeholder: "55" },
    { key: "bodyFat", label: "אחוז שומן (%)", placeholder: "18" },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Scale className="w-6 h-6 text-green-400" />
        עדכון מדדים
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <p className="text-sm text-gray-500">מלא רק את המדדים שאתה רוצה לעקוב אחריהם</p>
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                <input
                  type="number"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  step="0.1"
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">הערות</label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="הערות נוספות..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "שומר..." : "שמור מדדים"}
        </button>
      </form>
    </div>
  );
}
