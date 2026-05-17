"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface DataPoint {
  date: string;
  value: number;
}

export default function WeightChart({ data, label, color = "#f97316" }: { data: DataPoint[]; label: string; color?: string }) {
  if (data.length < 2) return null;

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        borderColor: color,
        backgroundColor: color + "20",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#9ca3af",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", font: { size: 11 } },
        grid: { color: "#1f2937" },
      },
      y: {
        ticks: { color: "#6b7280", font: { size: 11 } },
        grid: { color: "#1f2937" },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
