import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeProgress(data: {
  workouts: Array<{ date: string; name: string; exercises: Array<{ name: string; sets: number; reps: number; weight: number | null }> }>;
  bodyStats: Array<{ date: string; weight: number | null; chest: number | null; waist: number | null; hips: number | null; arms: number | null; legs: number | null; bodyFat: number | null }>;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
אתה מאמן כושר ותזונאי מקצועי. נתח את נתוני האימון וההתקדמות הבאים ותן תובנות מפורטות בעברית.

נתוני אימונים (${data.workouts.length} אימונים):
${JSON.stringify(data.workouts.slice(-20), null, 2)}

נתוני גוף (${data.bodyStats.length} מדידות):
${JSON.stringify(data.bodyStats.slice(-20), null, 2)}

אנא ספק:
1. סיכום ההתקדמות הכללית
2. נקודות חוזק שהשתפרו
3. אזורים שדורשים תשומת לב
4. המלצות ספציפיות לשבוע הבא
5. הערכת עקביות האימונים

ענה בצורה ידידותית ומעודדת בעברית.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function askFitnessQuestion(question: string, context: {
  recentWorkouts?: number;
  avgWeight?: number;
  totalWorkouts?: number;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
אתה מאמן כושר ותזונאי מקצועי. ענה על השאלה הבאה בעברית בצורה מקצועית וידידותית.

הקשר המשתמש:
- סה"כ אימונים: ${context.totalWorkouts || 0}
- אימונים ב-30 ימים אחרונים: ${context.recentWorkouts || 0}
- משקל ממוצע: ${context.avgWeight ? context.avgWeight + ' ק"ג' : 'לא זמין'}

שאלה: ${question}

ענה בעברית בצורה ברורה ומעשית.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
