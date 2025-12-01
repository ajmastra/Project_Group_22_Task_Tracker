import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import analyticsService from "../services/analyticsService";
import StatCard from "../components/analytics/StatCard";
import StatusPieChart from "../components/analytics/StatusPieChart";
import PriorityBarChart from "../components/analytics/PriorityBarChart";
import CompletionLineChart from "../components/analytics/CompletionLineChart";
import ProductivityChart from "../components/analytics/ProductivityChart";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [priorityLoading, setPriorityLoading] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        // Load dashboard summary
        const summaryResponse = await analyticsService.getDashboardSummary();
        if (summaryResponse.success) {
          setSummary(summaryResponse.data);
        }

        // Load status data
        setStatusLoading(true);
        const statusResponse = await analyticsService.getTasksByStatus();
        if (statusResponse.success) {
          setStatusData(statusResponse.data);
        }
        setStatusLoading(false);

        // Load priority data
        setPriorityLoading(true);
        const priorityResponse = await analyticsService.getTasksByPriority();
        if (priorityResponse.success) {
          setPriorityData(priorityResponse.data);
        }
        setPriorityLoading(false);

        // Load completion rate data
        setCompletionLoading(true);
        const completionResponse = await analyticsService.getCompletionRate({
          period,
        });
        if (completionResponse.success) {
          setCompletionData(completionResponse.data);
        }
        setCompletionLoading(false);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCompletionLoading(true);
    analyticsService
      .getCompletionRate({ period: newPeriod })
      .then((response) => {
        if (response.success) {
          setCompletionData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error loading completion data:", error);
      })
      .finally(() => {
        setCompletionLoading(false);
      });
  };

  // Calculate due soon tasks (due in next 7 days)
  const dueSoonCount =
    summary?.summary?.total_tasks > 0
      ? Math.max(0, summary.summary.total_tasks - summary.summary.completed_tasks - summary.summary.overdue_tasks)
      : 0;

  if (loading && !summary) {
    return (
      <div className="page-container">
        <div className="analytics-page">
          <div className="analytics-header">
            <h1>Analytics Dashboard</h1>
          </div>
          <div className="stat-cards-grid">
            <LoadingSkeleton type="stat" count={4} />
          </div>
          <div className="charts-grid">
            <LoadingSkeleton type="chart" count={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Track your task performance and productivity
          </p>
        </div>

        {/* Statistics Cards */}
        {loading ? (
          <div className="stat-cards-grid">
            <LoadingSkeleton type="stat" count={4} />
          </div>
        ) : (
          <div className="stat-cards-grid">
            <StatCard
              title="Total Tasks"
              value={summary?.summary?.total_tasks || 0}
              icon="📋"
              color="#3B82F6"
            />
            <StatCard
              title="Completed"
              value={summary?.summary?.completed_tasks || 0}
              icon="✅"
              color="#10B981"
              subtitle={`${summary?.summary?.completion_rate || 0}% completion rate`}
            />
            <StatCard
              title="Overdue"
              value={summary?.summary?.overdue_tasks || 0}
              icon="⚠️"
              color="#EF4444"
            />
            <StatCard
              title="Due Soon"
              value={dueSoonCount}
              icon="⏰"
              color="#F59E0B"
              subtitle="Next 7 days"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="charts-grid">
          <div className="chart-card">
            <StatusPieChart data={statusData} loading={statusLoading} />
          </div>

          <div className="chart-card">
            <PriorityBarChart data={priorityData} loading={priorityLoading} />
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card chart-card-wide">
            <div className="chart-period-selector">
              <label>Time Period:</label>
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="chart-period-select"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <CompletionLineChart
              data={completionData}
              loading={completionLoading}
              period={period}
            />
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card chart-card-wide">
            <ProductivityChart userId={user?.user_id} />
          </div>
        </div>
      </div>
    </div>
  );
}

