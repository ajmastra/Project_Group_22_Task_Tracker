import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PriorityBarChart({ data, loading }) {
  if (loading) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  if (!data || !data.chartData) {
    return <div className="chart-empty">No data available</div>;
  }

  const chartData = {
    ...data.chartData,
    datasets: [
      {
        ...data.chartData.datasets[0],
        backgroundColor: [
          "#10B981", // green - low
          "#F59E0B", // amber - medium
          "#EF4444", // red - high
        ],
        borderColor: [
          "#059669",
          "#D97706",
          "#DC2626",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label || ""}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Task Distribution by Priority</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

