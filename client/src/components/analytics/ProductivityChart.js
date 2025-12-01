import React, { useState, useEffect } from "react";
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
import axiosInstance from "../../utils/axiosInstance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ProductivityChart({ userId }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const loadProductivityData = async () => {
      setLoading(true);
      try {
        // Get tasks created and completed in the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const tasksResponse = await axiosInstance.get("/tasks");
        const tasks = tasksResponse.data.data?.tasks || tasksResponse.data.tasks || [];

        // Filter tasks for the last 7 days
        const recentTasks = tasks.filter((task) => {
          const createdDate = new Date(task.created_at);
          return createdDate >= startDate;
        });

        // Group by day
        const dailyData = {};
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dailyData[dateStr] = { created: 0, completed: 0 };
        }

        // Count tasks created per day
        recentTasks.forEach((task) => {
          const createdDate = new Date(task.created_at);
          const dateStr = createdDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          if (dailyData[dateStr]) {
            dailyData[dateStr].created++;
          }
        });

        // Count tasks completed per day (check all tasks, not just recent)
        tasks.forEach((task) => {
          if (task.status === "completed" && task.updated_at) {
            const completedDate = new Date(task.updated_at);
            if (completedDate >= startDate && completedDate <= endDate) {
              const completedDateStr = completedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              if (dailyData[completedDateStr]) {
                dailyData[completedDateStr].completed++;
              }
            }
          }
        });

        const labels = Object.keys(dailyData);
        const createdData = Object.values(dailyData).map((d) => d.created);
        const completedData = Object.values(dailyData).map((d) => d.completed);

        setChartData({
          labels,
          datasets: [
            {
              label: "Tasks Created",
              data: createdData,
              backgroundColor: "#3B82F6",
              borderColor: "#2563EB",
              borderWidth: 1,
            },
            {
              label: "Tasks Completed",
              data: completedData,
              backgroundColor: "#10B981",
              borderColor: "#059669",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error loading productivity data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProductivityData();
    }
  }, [userId]);

  if (loading) {
    return <div className="chart-loading">Loading productivity data...</div>;
  }

  if (!chartData) {
    return <div className="chart-empty">No productivity data available</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
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
      <h3 className="chart-title">User Productivity (Last 7 Days)</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

