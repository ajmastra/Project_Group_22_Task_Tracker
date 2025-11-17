import React, { useState, useEffect } from "react";

export default function TaskForm({ initialData, onSubmit, submitting }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "new",
    priority: "medium",
    due_date: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "new",
        priority: initialData.priority || "medium",
        due_date: initialData.due_date ? initialData.due_date.split("T")[0] : "",
      });
    } else {
      // Reset form when not editing
      setForm({
        title: "",
        description: "",
        status: "new",
        priority: "medium",
        due_date: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form-section">
      <h3>{initialData ? "Edit Task" : "Create Task"}</h3>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="form-textarea"
        ></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="form-select"
        >
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Priority</label>
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="form-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          required
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          className="form-input"
        />
      </div>

      <button type="submit" disabled={submitting} className="form-button">
        {submitting ? "Saving..." : initialData ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
}
