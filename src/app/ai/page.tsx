"use client";

import { useState } from "react";
import { Brain, Send, Sparkles, TrendingUp } from "lucide-react";

export default function AIPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [chat, setChat] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/analyze");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis("שגיאה בניתוח. אנא נסה שוב.");
    } finally {
      setAnalyzing(false);
    }
  };

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const q = question.trim();
    setQuestion("");
    setAsking(true);
    setChat((prev) => [...prev, { role: "user", text: q }]);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch {
      setChat((prev) => [...prev, { role: "ai", text: "שגיאה. אנא נסה שוב." }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-400" />
        ניתוח AI
      </h1>

      {/* Analysis Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              ניתוח התקדמות
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              AI ינתח את האימונים והמדדים שלך ויתן תובנות
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? "מנתח..." : "נתח עכשיו"}
          </button>
        </div>

        {analyzing && (
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            מנתח את הנתונים שלך...
          </div>
        )}

        {analysis && (
          <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          שאל את המאמן האישי
        </h2>
        <p className="text-sm text-gray-500">שאל כל שאלה על כושר, תזונה והתקדמות</p>

        {/* Chat history */}
        {chat.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-tl-sm"
                      : "bg-gray-800 text-gray-300 rounded-tr-sm"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-1 text-blue-400 text-xs mb-1">
                      <Brain className="w-3 h-3" />
                      מאמן AI
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample questions */}
        {chat.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {["איך אשפר את הכוח שלי?", "כמה פעמים לאמן בשבוע?", "מה לאכול לפני אימון?"].map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={askQuestion} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="שאל שאלה..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white px-4 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
