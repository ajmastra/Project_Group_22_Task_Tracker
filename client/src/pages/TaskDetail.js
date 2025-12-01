import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import CommentSection from "../components/tasks/CommentSection";
import ActivityTimeline from "../components/tasks/ActivityTimeline";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [assignedUser, setAssignedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/tasks/${id}`);
        if (response.data.success) {
          const taskData = response.data.data.task;
          setTask(taskData);

          // Load assigned user if task is assigned
          if (taskData.assigned_to) {
            try {
              const userResponse = await axiosInstance.get(
                `/users/${taskData.assigned_to}`
              );
              if (userResponse.data.success) {
                setAssignedUser(userResponse.data.data.user);
              }
            } catch (err) {
              console.error("Error loading assigned user:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading task:", err);
        setError(err?.response?.data?.error || "Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTask();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (error || !task) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error || "Task not found"}
        </div>
        <button onClick={() => navigate("/tasks")} className="form-button">
          Back to Tasks
        </button>
      </div>
    );
  }

  const getPriorityLabel = (priority) => {
    if (priority === 1 || priority === "low") return "Low";
    if (priority === 2 || priority === "medium") return "Medium";
    if (priority === 3 || priority === "high") return "High";
    return priority;
  };

  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="page-container">
      <div className="task-detail-page">
        <button onClick={() => navigate("/tasks")} className="back-button">
          ← Back to Tasks
        </button>

        <div className="task-detail-header">
          <h1 className="task-detail-title">{task.title}</h1>
          <div className="task-detail-meta">
            <span className={`task-status-badge task-status-${task.status}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className={`task-priority-badge task-priority-${getPriorityLabel(task.priority).toLowerCase()}`}>
              {getPriorityLabel(task.priority)} Priority
            </span>
          </div>
        </div>

        <div className="task-detail-content">
          <div className="task-detail-main">
            <div className="task-detail-section">
              <h3>Description</h3>
              <p className="task-detail-description">
                {task.description || "No description provided."}
              </p>
            </div>

            <div className="task-detail-info-grid">
              <div className="task-detail-info-item">
                <strong>Due Date:</strong>{" "}
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString()
                  : "No due date"}
              </div>
              {assignedUser && (
                <div className="task-detail-info-item">
                  <strong>Assigned to:</strong>{" "}
                  {`${assignedUser.first_name || ""} ${assignedUser.last_name || ""}`.trim() ||
                    assignedUser.email ||
                    "Unknown"}
                </div>
              )}
              <div className="task-detail-info-item">
                <strong>Created:</strong>{" "}
                {new Date(task.created_at).toLocaleDateString()}
              </div>
              <div className="task-detail-info-item">
                <strong>Last Updated:</strong>{" "}
                {new Date(task.updated_at).toLocaleDateString()}
              </div>
            </div>

            <CommentSection taskId={task.task_id} />
          </div>

          <div className="task-detail-sidebar">
            <ActivityTimeline taskId={task.task_id} />
          </div>
        </div>
      </div>
    </div>
  );
}

