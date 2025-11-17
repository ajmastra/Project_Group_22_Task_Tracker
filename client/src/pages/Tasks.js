import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import TaskForm from "../components/tasks/TaskForm";
import TaskList from "../components/tasks/TaskList";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filter and search state
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dueDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load all tasks (no server-side filtering for now - we'll do client-side)
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/tasks");
      // Backend returns: { success: true, data: { tasks: [...] } }
      const tasksArray = res.data.data?.tasks || res.data.tasks || [];
      setTasks(Array.isArray(tasksArray) ? tasksArray : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]); // Ensure tasks is always an array on error
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []); // Only load once on mount

  // Filter and sort tasks client-side
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply status filter
    if (filters.status) {
      result = result.filter((task) => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      const priorityMap = { low: 1, medium: 2, high: 3 };
      const priorityValue = priorityMap[filters.priority];
      result = result.filter((task) => {
        // Handle both integer (1,2,3) and string ("low","medium","high") priorities
        const taskPriority = task.priority;
        if (typeof taskPriority === "number") {
          return taskPriority === priorityValue;
        } else if (typeof taskPriority === "string") {
          return taskPriority.toLowerCase() === filters.priority.toLowerCase();
        }
        return false;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply due date filter
    if (filters.dueDate) {
      const filterDate = new Date(filters.dueDate).toISOString().split("T")[0];
      result = result.filter((task) => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date).toISOString().split("T")[0];
        return taskDate === filterDate;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "priority":
          aValue = a.priority || 0;
          bValue = b.priority || 0;
          break;
        case "status":
          aValue = (a.status || "").toLowerCase();
          bValue = (b.status || "").toLowerCase();
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case "created_at":
        default:
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return result;
  }, [tasks, filters.status, filters.priority, filters.dueDate, searchQuery, sortBy, sortOrder]);

  // Create or update task
  const handleSubmitTask = async (formData) => {
    setSubmitting(true);

    try {
      if (editingTask) {
        const taskId = editingTask.task_id || editingTask.id;
        await axiosInstance.put(`/tasks/${taskId}`, formData);
      } else {
        await axiosInstance.post("/tasks", formData);
      }
      await loadTasks();
      setEditingTask(null);
    } catch (err) {
      console.error("Task save error:", err);
    }

    setSubmitting(false);
  };

  // Delete task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      console.error("Task delete error:", err);
    }
  };

  const handleClearFilters = () => {
    setFilters({ status: "", priority: "", dueDate: "" });
    setSearchQuery("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  return (
    <div className="tasks-page">
      <TaskForm
        initialData={editingTask}
        onSubmit={handleSubmitTask}
        submitting={submitting}
      />

      {/* Filter and Search Controls */}
      <div className="filter-section">
        <h3>Filter & Search Tasks</h3>
        
        {/* Search */}
        <div className="filter-group" style={{ marginBottom: 16 }}>
          <label className="filter-label">Search:</label>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Filters Row */}
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority:</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="filter-select"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Due Date:</label>
            <input
              type="date"
              value={filters.dueDate}
              onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
              className="filter-input"
            />
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.status || filters.priority || filters.dueDate || searchQuery) && (
          <button onClick={handleClearFilters} className="filter-button">
            Clear All Filters
          </button>
        )}

        {/* Results Count */}
        <div className="results-count">
          Showing {filteredAndSortedTasks.length} of {tasks.length} task(s)
        </div>
      </div>

      <TaskList
        tasks={filteredAndSortedTasks}
        loading={loading}
        onEdit={(task) => setEditingTask(task)}
        onDelete={handleDelete}
      />
    </div>
  );
}
