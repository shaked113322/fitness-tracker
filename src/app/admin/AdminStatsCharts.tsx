"use client";

import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Filler, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

interface DayPoint { date: string; count: number; }

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { mode: "index" as const } },
  scales: {
    x: { ticks: { color: "#6b7280", font: { size: 10 } }, grid: { color: "#1f2937" } },
    y: { ticks: { color: "#6b7280", stepSize: 1 }, grid: { color: "#1f2937" }, beginAtZero: true },
  },
};

export default function AdminStatsCharts() {
  const [workouts, setWorkouts] = useState<DayPoint[]>([]);
  const [users, setUsers] = useState<DayPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setWorkouts(d.workoutsByDay ?? []);
        setUsers(d.usersByDay ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-32 flex items-center justify-center text-gray-600 text-sm">טוען גרפים...</div>;

  const labels = workouts.map((d) => d.date);

  const workoutData = {
    labels,
    datasets: [{ data: workouts.map((d) => d.count), borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)", fill: true, tension: 0.4, pointRadius: 2 }],
  };
  const userData = {
    labels,
    datasets: [{ data: users.map((d) => d.count), backgroundColor: "#3b82f6", borderRadius: 4 }],
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4 text-sm">אימונים ביום — 30 ימים אחרונים</h2>
        <Line data={workoutData} options={chartOptions} />
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4 text-sm">משתמשים חדשים ביום — 30 ימים אחרונים</h2>
        <Bar data={userData} options={chartOptions} />
      </div>
    </div>
  );
}
