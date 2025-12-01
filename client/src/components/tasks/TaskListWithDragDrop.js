import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

function SortableTaskItem({ task, assignedUser, onEdit, onDelete, isSelected, onSelect, onTaskClick }) {
  const taskId = task.task_id || task.id;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card-wrapper ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={onTaskClick}
    >
      <div className="task-card-checkbox-wrapper">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(taskId, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="task-card-checkbox"
        />
        <div
          className="task-card-drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </div>
      </div>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        assignedUser={assignedUser}
      />
    </div>
  );
}

export default function TaskListWithDragDrop({
  tasks,
  loading,
  onEdit,
  onDelete,
  assignedUsers,
  onReorder,
}) {
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [localTasks, setLocalTasks] = useState(tasks);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalTasks((items) => {
        const oldIndex = items.findIndex(
          (item) => (item.task_id || item.id) === active.id
        );
        const newIndex = items.findIndex(
          (item) => (item.task_id || item.id) === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newTasks = arrayMove(items, oldIndex, newIndex);
          
          // Call onReorder callback if provided
          if (onReorder) {
            onReorder(newTasks);
          }

          return newTasks;
        }
        return items;
      });
    }
  };

  const handleSelect = (taskId, isSelected) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTasks(new Set(localTasks.map((t) => t.task_id || t.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.task_id || task.id}`);
  };

  const handleBulkDelete = () => {
    if (selectedTasks.size === 0) return;
    if (window.confirm(`Delete ${selectedTasks.size} selected task(s)?`)) {
      selectedTasks.forEach((taskId) => {
        onDelete(taskId);
      });
      setSelectedTasks(new Set());
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  const tasksArray = Array.isArray(localTasks) ? localTasks : [];

  if (tasksArray.length === 0) {
    return <div className="empty-state">No tasks found. Create your first task!</div>;
  }

  const allSelected = tasksArray.length > 0 && selectedTasks.size === tasksArray.length;
  const someSelected = selectedTasks.size > 0 && selectedTasks.size < tasksArray.length;

  return (
    <div className="task-list-container">
      {selectedTasks.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-actions-count">
            {selectedTasks.size} task{selectedTasks.size !== 1 ? "s" : ""} selected
          </span>
          <div className="bulk-actions-buttons">
            <button
              className="bulk-action-button bulk-action-delete"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="bulk-action-button bulk-action-clear"
              onClick={() => setSelectedTasks(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="task-list-header">
        <label className="task-list-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={handleSelectAll}
          />
          <span>Select All</span>
        </label>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasksArray.map((t) => t.task_id || t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="task-list">
            {tasksArray.map((task) => {
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
                  isSelected={selectedTasks.has(task.task_id || task.id)}
                  onSelect={handleSelect}
                  onTaskClick={() => handleTaskClick(task)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

