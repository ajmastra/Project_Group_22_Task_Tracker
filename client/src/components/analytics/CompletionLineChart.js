import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CompletionLineChart({ data, loading, period = "month" }) {
  if (loading) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  if (!data || !data.chartData) {
    return <div className="chart-empty">No data available</div>;
  }

  const chartData = {
    labels: data.chartData.labels,
    datasets: data.chartData.datasets.map((dataset, index) => ({
      ...dataset,
      borderWidth: 2,
      fill: index === 2 ? false : true, // Don't fill completion rate line
      tension: 0.4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (label.includes("Rate")) {
                label += context.parsed.y + "%";
              } else {
                label += context.parsed.y;
              }
            }
            return label;
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
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Completion Trends Over Time</h3>
      <div className="chart-period-badge">Period: {period}</div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

