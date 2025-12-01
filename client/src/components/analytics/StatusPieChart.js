import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusPieChart({ data, loading }) {
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
          "#3B82F6", // blue - new
          "#10B981", // green - completed
          "#F59E0B", // amber - in_progress
          "#EF4444", // red - cancelled
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Task Distribution by Status</h3>
      <div className="chart-wrapper">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

