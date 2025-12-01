import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function ActivityTimeline({ taskId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadActivities = async () => {
      if (!taskId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/activities/task/${taskId}`);
        if (response.data.success) {
          setActivities(response.data.data.activities || []);
        }
      } catch (err) {
        console.error("Error loading activities:", err);
        setError("Failed to load activity history");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [taskId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getActionLabel = (action) => {
    const labels = {
      created: "Created task",
      updated: "Updated task",
      assigned: "Assigned task",
      status_changed: "Changed status",
      completed: "Completed task",
      deleted: "Deleted task",
    };
    return labels[action] || action;
  };

  const getUserName = (activity) => {
    const name = `${activity.first_name || ""} ${activity.last_name || ""}`.trim();
    return name || activity.email || "Unknown User";
  };

  if (loading) {
    return <div className="activity-timeline-loading">Loading activity history...</div>;
  }

  if (error) {
    return <div className="activity-timeline-error">{error}</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="activity-timeline-empty">
        No activity history available.
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      <h4 className="activity-timeline-title">Activity History</h4>
      <div className="activity-timeline-list">
        {activities.map((activity, index) => (
          <div key={activity.activity_id || index} className="activity-item">
            <div className="activity-item-dot"></div>
            <div className="activity-item-content">
              <div className="activity-item-header">
                <span className="activity-item-action">
                  {getActionLabel(activity.action)}
                </span>
                <span className="activity-item-time">
                  {formatDate(activity.created_at)}
                </span>
              </div>
              <div className="activity-item-user">
                by {getUserName(activity)}
              </div>
              {activity.description && (
                <div className="activity-item-description">
                  {activity.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

