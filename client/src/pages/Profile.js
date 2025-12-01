import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import TaskList from "../components/tasks/TaskList";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadTasks = async () => {
      setLoading(true);
      try {
        // Load assigned tasks
        if (user.user_id) {
          const assignedResponse = await axiosInstance.get(
            `/tasks?assigned_to=${user.user_id}`
          );
          if (assignedResponse.data.success) {
            setAssignedTasks(
              assignedResponse.data.data?.tasks || assignedResponse.data.tasks || []
            );
          }

          // Load created tasks
          const createdResponse = await axiosInstance.get("/tasks");
          if (createdResponse.data.success) {
            const allTasks =
              createdResponse.data.data?.tasks || createdResponse.data.tasks || [];
            setCreatedTasks(
              allTasks.filter((task) => task.created_by === user.user_id)
            );
          }
        }
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user, navigate]);

  const handleEdit = (task) => {
    navigate(`/tasks`);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      // Reload tasks
      const assignedResponse = await axiosInstance.get(
        `/tasks?assigned_to=${user.user_id}`
      );
      if (assignedResponse.data.success) {
        setAssignedTasks(
          assignedResponse.data.data?.tasks || assignedResponse.data.tasks || []
        );
      }
      const createdResponse = await axiosInstance.get("/tasks");
      if (createdResponse.data.success) {
        const allTasks =
          createdResponse.data.data?.tasks || createdResponse.data.tasks || [];
        setCreatedTasks(
          allTasks.filter((task) => task.created_by === user.user_id)
        );
      }
    } catch (err) {
      console.error("Task delete error:", err);
    }
  };

  if (!user) {
    return null;
  }

  const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "User";

  return (
    <div className="page-container">
      <div className="profile-page">
        <div className="profile-header">
          <h1>Profile</h1>
          <div className="profile-user-info">
            <div className="profile-user-name">{userName}</div>
            <div className="profile-user-email">{user.email}</div>
            <div className="profile-user-joined">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Tasks ({assignedTasks.length})
          </button>
          <button
            className={`profile-tab ${activeTab === "created" ? "active" : ""}`}
            onClick={() => setActiveTab("created")}
          >
            Created Tasks ({createdTasks.length})
          </button>
        </div>

        <div className="profile-content">
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            <TaskList
              tasks={activeTab === "assigned" ? assignedTasks : createdTasks}
              loading={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

