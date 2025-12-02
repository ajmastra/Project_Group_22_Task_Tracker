// necessary imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

// statuses for the kanban board
const STATUSES = [
  { id: "new", label: "New", color: "#1976d2" },
  { id: "in_progress", label: "In Progress", color: "#f57c00" },
  { id: "completed", label: "Completed", color: "#388e3c" },
  { id: "cancelled", label: "Cancelled", color: "#d32f2f" },
];

// SortableTaskItem component for the kanban board
function SortableTaskItem({ task, assignedUser, onEdit, onDelete, onTaskClick, isUpdating }) {
  const taskId = task.task_id || task.id;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: taskId,
    data: {
      type: 'task',
      task: task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle click - only navigate if not dragging
  const handleClick = (e) => {
    // Don't navigate if we just dragged or if clicking on buttons
    if (!isDragging && !e.target.closest('.task-card-actions')) {
      onTaskClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-task-item ${isUpdating ? "kanban-task-updating" : ""}`}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      {isUpdating && (
        <div className="kanban-task-update-indicator">
          <div className="kanban-task-update-spinner"></div>
        </div>
      )}
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        assignedUser={assignedUser}
      />
    </div>
  );
}

// KanbanColumn component for the kanban board
function KanbanColumn({ status, tasks, assignedUsers, onEdit, onDelete, onTaskClick, updatingTaskId }) {
  const { setNodeRef: setColumnRef, isOver } = useDroppable({
    id: status.id,
    data: {
      status: status.id,
      type: 'column',
    },
  });

  const { setNodeRef: setContentRef } = useDroppable({
    id: `${status.id}-content`,
    data: {
      status: status.id,
      type: 'column-content',
    },
  });

  const columnTasks = tasks.filter((task) => task.status === status.id);
  const taskIds = columnTasks.map((task) => task.task_id || task.id);

  return (
    <div
      ref={setColumnRef}
      className={`kanban-column ${isOver ? "kanban-column-drag-over" : ""}`}
      data-status={status.id}
    >
      <div className="kanban-column-header">
        <h3 className="kanban-column-title">{status.label}</h3>
        <span className="kanban-column-count">{columnTasks.length}</span>
      </div>
      <div ref={setContentRef} className="kanban-column-content-wrapper">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="kanban-column-content">
            {columnTasks.map((task) => {
              const assignedUser = assignedUsers?.find(
                (u) => u.user_id === task.assigned_to
              );
              return (
                <SortableTaskItem
                  key={task.task_id || task.id}
                  task={task}
                  assignedUser={assignedUser}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTaskClick={() => onTaskClick(task)}
                  isUpdating={updatingTaskId === (task.task_id || task.id)}
                />
              );
            })}
            {columnTasks.length === 0 && (
              <div className="kanban-column-empty">No tasks</div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}


export default function KanbanBoard({
  tasks,
  loading,
  onEdit,
  onDelete,
  assignedUsers,
  onStatusChange,
  onTasksUpdate,
}) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Sync local tasks when tasks prop changes (from parent)
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    let newStatus = null;

    // Check if dropped on a status column (multiple ways to detect)
    if (over.data?.current?.status) {
      newStatus = over.data.current.status;
    } else if (STATUSES.some((s) => s.id === over.id)) {
      // Direct drop on column ID
      newStatus = over.id;
    } else if (over.id && over.id.includes('-content')) {
      // Drop on column content area
      const statusId = over.id.replace('-content', '');
      if (STATUSES.some((s) => s.id === statusId)) {
        newStatus = statusId;
      }
    } else if (over.data?.current?.task) {
      // Dropped on another task - use that task's status
      const droppedOnTask = over.data.current.task;
      newStatus = droppedOnTask.status;
    }

    if (newStatus && STATUSES.some((s) => s.id === newStatus)) {
      const task = localTasks.find((t) => (t.task_id || t.id) === taskId);
      if (task && task.status !== newStatus) {
        // OPTIMISTIC UPDATE: Update local state immediately
        const updatedTasks = localTasks.map((t) =>
          (t.task_id || t.id) === taskId
            ? { ...t, status: newStatus }
            : t
        );
        setLocalTasks(updatedTasks);
        setUpdatingTaskId(taskId);

        // Notify parent of local change (for state sync)
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }

        // Update backend asynchronously (don't block UI)
        if (onStatusChange) {
          onStatusChange(taskId, newStatus)
            .then(() => {
              setUpdatingTaskId(null);
            })
            .catch((error) => {
              // On error, revert optimistic update
              console.error("Status update failed:", error);
              setLocalTasks(tasks); // Revert to original tasks from props
              setUpdatingTaskId(null);
              // Notify parent to revert as well
              if (onTasksUpdate) {
                onTasksUpdate(tasks);
              }
            });
        }
      }
    }
  };

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.task_id || task.id}`);
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  const activeTask = activeId
    ? localTasks.find((t) => (t.task_id || t.id) === activeId)
    : null;

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board-container">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              tasks={localTasks}
              assignedUsers={assignedUsers}
              onEdit={onEdit}
              onDelete={onDelete}
              onTaskClick={handleTaskClick}
              updatingTaskId={updatingTaskId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="kanban-task-item-dragging">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                assignedUser={assignedUsers?.find(
                  (u) => u.user_id === activeTask.assigned_to
                )}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

