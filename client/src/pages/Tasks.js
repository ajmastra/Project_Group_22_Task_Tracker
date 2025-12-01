import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import TaskForm from "../components/tasks/TaskForm";
import TaskListWithDragDrop from "../components/tasks/TaskListWithDragDrop";
import KanbanBoard from "../components/tasks/KanbanBoard";
import FilterPanel from "../components/tasks/FilterPanel";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import Modal from "../components/common/Modal";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "list"
  
  // Filter and search state - updated for multi-select and date range
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    startDate: "",
    endDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load all tasks and assigned users
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/tasks");
      // Backend returns: { success: true, data: { tasks: [...] } }
      const tasksArray = res.data.data?.tasks || res.data.tasks || [];
      setTasks(Array.isArray(tasksArray) ? tasksArray : []);

      // Load assigned users
      const userIds = [
        ...new Set(
          tasksArray
            .map((task) => task.assigned_to)
            .filter((id) => id !== null && id !== undefined)
        ),
      ];

      if (userIds.length > 0) {
        try {
          const usersResponse = await axiosInstance.get("/users");
          const allUsers = usersResponse.data.data?.users || usersResponse.data.users || [];
          const assignedUsersMap = allUsers.filter((user) =>
            userIds.includes(user.user_id)
          );
          setAssignedUsers(assignedUsersMap);
        } catch (err) {
          console.error("Error fetching assigned users:", err);
        }
      }
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

    // Apply status filter (multi-select)
    if (filters.status && filters.status.length > 0) {
      result = result.filter((task) => filters.status.includes(task.status));
    }

    // Apply priority filter (multi-select)
    if (filters.priority && filters.priority.length > 0) {
      const priorityMap = { low: 1, medium: 2, high: 3 };
      result = result.filter((task) => {
        // Handle both integer (1,2,3) and string ("low","medium","high") priorities
        const taskPriority = task.priority;
        if (typeof taskPriority === "number") {
          return filters.priority.some((p) => priorityMap[p] === taskPriority);
        } else if (typeof taskPriority === "string") {
          return filters.priority.some(
            (p) => taskPriority.toLowerCase() === p.toLowerCase()
          );
        }
        return false;
      });
    }

    // Apply search filter (real-time)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply due date range filter
    if (filters.startDate || filters.endDate) {
      result = result.filter((task) => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date).toISOString().split("T")[0];
        const taskDateObj = new Date(taskDate);
        
        if (filters.startDate && filters.endDate) {
          const startDateObj = new Date(filters.startDate);
          const endDateObj = new Date(filters.endDate);
          return taskDateObj >= startDateObj && taskDateObj <= endDateObj;
        } else if (filters.startDate) {
          const startDateObj = new Date(filters.startDate);
          return taskDateObj >= startDateObj;
        } else if (filters.endDate) {
          const endDateObj = new Date(filters.endDate);
          return taskDateObj <= endDateObj;
        }
        return true;
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
  }, [tasks, filters.status, filters.priority, filters.startDate, filters.endDate, searchQuery, sortBy, sortOrder]);

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
      setIsModalOpen(false);
    } catch (err) {
      console.error("Task save error:", err);
    }

    setSubmitting(false);
  };

  // Handle status change from kanban drag and drop (optimistic update)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Update local state immediately (optimistic update)
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          (task.task_id || task.id) === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );

      // Update backend (fire and forget, handle errors separately)
      await axiosInstance.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Task status update error:", err);
      // Revert optimistic update on error by reloading from server
      await loadTasks();
      // Could show error toast notification here
      throw err; // Re-throw so KanbanBoard can handle it
    }
  };

  // Handle tasks update from KanbanBoard (for optimistic updates)
  const handleTasksUpdate = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  // Open modal for creating new task
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal for editing task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
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
    setFilters({ status: [], priority: [], startDate: "", endDate: "" });
    setSearchQuery("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const handleRemoveFilter = (filterType, filterValue) => {
    if (filterType === "status") {
      setFilters({
        ...filters,
        status: filters.status.filter((s) => s !== filterValue),
      });
    } else if (filterType === "priority") {
      setFilters({
        ...filters,
        priority: filters.priority.filter((p) => p !== filterValue),
      });
    } else if (filterType === "dateRange") {
      setFilters({
        ...filters,
        startDate: "",
        endDate: "",
      });
    } else if (filterType === "search") {
      setSearchQuery("");
    }
  };

  return (
    <div className="tasks-page">
      {/* Header with Create Task Button and View Toggle */}
      <div className="tasks-page-header">
        <button className="create-task-button" onClick={handleCreateTask}>
          + Create Task
        </button>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-button ${viewMode === "kanban" ? "active" : ""}`}
            onClick={() => setViewMode("kanban")}
          >
            Kanban
          </button>
          <button
            className={`view-mode-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? "Edit Task" : "Create Task"}
      >
        <TaskForm
          initialData={editingTask}
          onSubmit={handleSubmitTask}
          submitting={submitting}
        />
      </Modal>

      {/* Advanced Filter Panel */}
      <FilterPanel
        filters={filters}
        searchQuery={searchQuery}
        onFilterChange={setFilters}
        onSearchChange={setSearchQuery}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearFilters}
      />

      {/* Sorting Controls */}
      <div className="filter-section">
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

        {/* Results Count */}
        <div className="results-count">
          Showing {filteredAndSortedTasks.length} of {tasks.length} task(s)
        </div>
      </div>

      {loading ? (
        <div className="task-list">
          <LoadingSkeleton type="task" count={6} />
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          tasks={filteredAndSortedTasks}
          loading={false}
          onEdit={handleEditTask}
          onDelete={handleDelete}
          assignedUsers={assignedUsers}
          onStatusChange={handleStatusChange}
          onTasksUpdate={handleTasksUpdate}
        />
      ) : (
        <TaskListWithDragDrop
          tasks={filteredAndSortedTasks}
          loading={false}
          onEdit={handleEditTask}
          onDelete={handleDelete}
          assignedUsers={assignedUsers}
          onReorder={(newTasks) => {
            // Update local order (client-side only, could be saved to backend)
            setTasks(newTasks);
          }}
        />
      )}
    </div>
  );
}
