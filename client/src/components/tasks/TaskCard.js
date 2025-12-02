import React from "react";

export default function TaskCard({ task, onEdit, onDelete, assignedUser }) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description || "No description"}</p>
      <p><strong>Status:</strong> {task.status || "new"}</p>
      <p>
        <strong>Priority:</strong>{" "}
        {task.priority === 1 || task.priority === "low"
          ? "Low"
          : task.priority === 2 || task.priority === "medium"
          ? "Medium"
          : task.priority === 3 || task.priority === "high"
          ? "High"
          : task.priority}
      </p>
      <p><strong>Due:</strong> {task.due_date ? task.due_date.split("T")[0] : "No due date"}</p>
      {assignedUser && (
        <p>
          <strong>Assigned to:</strong>{" "}
          {`${assignedUser.first_name || ""} ${assignedUser.last_name || ""}`.trim() ||
            assignedUser.email ||
            "Unknown"}
        </p>
      )}

      <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }} 
          className="task-button task-button-edit"
        >
          Edit
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.task_id || task.id);
          }} 
          className="task-button task-button-delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
