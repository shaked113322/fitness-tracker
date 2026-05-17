"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Dumbbell, Save } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: string;
  notes: string;
}

const COMMON_EXERCISES = [
  "לחיצת חזה", "לחיצת כתפיים", "משיכת גב", "סקוואט", "דדליפט",
  "כפיפות מרפק", "שכיבות שמיכה", "פשיטת טריצפס", "לאנג'", "לחיצת רגלים",
  "הרמת עגל", "כפיפות בטן", "פלאנק", "ריצה", "אופניים",
];

export default function NewWorkoutPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: 3, reps: 10, weight: "", notes: "" },
  ]);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, weight: "", notes: "" }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          duration: duration ? parseInt(duration) : null,
          notes,
          exercises: exercises.filter((ex) => ex.name.trim()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/workouts/${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Dumbbell className="w-6 h-6 text-orange-400" />
        אימון חדש
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-white">פרטי האימון</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">שם האימון *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="למשל: גב + כתפיים, פלג גוף עליון..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">משך (דקות)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">הערות</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="איך הרגשת, מה עבד טוב..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          <h2 className="font-semibold text-white">תרגילים</h2>
          {exercises.map((exercise, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-400">תרגיל {idx + 1}</span>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(idx)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => updateExercise(idx, "name", e.target.value)}
                  placeholder="שם התרגיל"
                  list={`exercises-${idx}`}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <datalist id={`exercises-${idx}`}>
                  {COMMON_EXERCISES.map((ex) => (
                    <option key={ex} value={ex} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">סטים</label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(idx, "sets", parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">חזרות</label>
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(idx, "reps", parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">משקל (ק&quot;ג)</label>
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={(e) => updateExercise(idx, "weight", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.5"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors text-center"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addExercise}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-700 hover:border-orange-500 text-gray-500 hover:text-orange-400 rounded-xl py-3 transition-colors"
          >
            <Plus className="w-4 h-4" />
            הוסף תרגיל
          </button>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "שומר..." : "שמור אימון"}
        </button>
      </form>
    </div>
  );
}
