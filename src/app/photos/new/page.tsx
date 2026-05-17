"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Save } from "lucide-react";
import Image from "next/image";

export default function NewPhotoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/photos");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Camera className="w-6 h-6 text-purple-400" />
        הוסף תמונה
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          {/* Upload Area */}
          <div>
            <label
              htmlFor="photo-upload"
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                preview ? "border-orange-500/50" : "border-gray-700 hover:border-orange-500/50"
              } overflow-hidden`}
            >
              {preview ? (
                <div className="relative w-full aspect-[3/4]">
                  <Image src={preview} alt="תצוגה מקדימה" fill className="object-cover" />
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <Upload className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">לחץ להעלאת תמונה</p>
                  <p className="text-gray-600 text-sm mt-1">JPG, PNG, WEBP</p>
                </div>
              )}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">תיאור (אופציונלי)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="לפני, אחרי, חודש 1..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !file}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "מעלה..." : "שמור תמונה"}
        </button>
      </form>
    </div>
  );
}
