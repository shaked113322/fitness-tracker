# הוראות התקנה ו-Deploy

## שלב 1 — Neon Database (חינמי)

1. היכנס ל־ https://console.neon.tech
2. צור חשבון חינמי (Sign up with GitHub)
3. צור פרויקט חדש → בחר שם
4. לחץ על "Connection string" והעתק את ה-URL
   נראה כך: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

## שלב 2 — Google Gemini API Key (חינמי)

1. היכנס ל־ https://aistudio.google.com/app/apikey
2. לחץ "Create API Key"
3. העתק את ה-Key

## שלב 3 — הגדרת קובץ סביבה

עדכן את קובץ `.env.local` עם הערכים שקיבלת:

```
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="AIza..."
```

## שלב 4 — הרצת Migration (יצירת טבלאות)

```bash
npx prisma migrate dev --name init
```

## שלב 5 — הרצה מקומית

```bash
npm run dev
```

האתר יפתח ב־ http://localhost:3000

---

## Deploy ל-Vercel

### 1. העלה ל-GitHub

```bash
git add .
git commit -m "initial commit"
git push
```

### 2. חבר ל-Vercel

1. היכנס ל־ https://vercel.com
2. "Add New Project" → בחר את ה-repo מ-GitHub
3. **Root Directory**: שנה ל- `fitness-tracker`
4. לחץ Deploy

### 3. הוסף משתני סביבה ב-Vercel

ב-Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL` = ה-connection string של Neon
- `GEMINI_API_KEY` = ה-API key של Gemini

### 4. הוסף Vercel Blob (לתמונות)

ב-Vercel Dashboard → Storage → Create Database → Blob
→ Connect to Project → יוסיף אוטומטית `BLOB_READ_WRITE_TOKEN`

### 5. הרץ Migration ב-Production

```bash
npx prisma migrate deploy
```

---

זהו! האתר יהיה חי ב-`https://your-project.vercel.app`
