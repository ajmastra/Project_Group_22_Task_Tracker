import React from "react";
import TaskCard from "./TaskCard";

export default function TaskList({ tasks, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  // Ensure tasks is always an array
  const tasksArray = Array.isArray(tasks) ? tasks : [];

  if (tasksArray.length === 0) {
    return <div className="empty-state">No tasks found. Create your first task!</div>;
  }

  return (
    <div className="task-list">
      {tasksArray.map((task) => (
        <TaskCard key={task.task_id || task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
