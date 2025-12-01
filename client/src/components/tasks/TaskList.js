import React from "react";
import { useNavigate } from "react-router-dom";
import TaskCard from "./TaskCard";

export default function TaskList({ tasks, loading, onEdit, onDelete, assignedUsers }) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  // Ensure tasks is always an array
  const tasksArray = Array.isArray(tasks) ? tasks : [];

  if (tasksArray.length === 0) {
    return <div className="empty-state">No tasks found. Create your first task!</div>;
  }

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.task_id || task.id}`);
  };

  return (
    <div className="task-list">
      {tasksArray.map((task) => {
        const assignedUser = assignedUsers?.find(
          (u) => u.user_id === task.assigned_to
        );
        return (
          <div
            key={task.task_id || task.id}
            className="task-card-wrapper"
            onClick={() => handleTaskClick(task)}
          >
            <TaskCard
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              assignedUser={assignedUser}
            />
          </div>
        );
      })}
    </div>
  );
}
