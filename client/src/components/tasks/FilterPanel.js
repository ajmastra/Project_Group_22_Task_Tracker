import React from "react";
import MultiSelectDropdown from "./MultiSelectDropdown";
import DateRangePicker from "./DateRangePicker";
import FilterTags from "./FilterTags";

export default function FilterPanel({
  filters,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onRemoveFilter,
  onClearAll,
}) {
  const statusOptions = [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const handleStatusChange = (selectedStatuses) => {
    onFilterChange({ ...filters, status: selectedStatuses });
  };

  const handlePriorityChange = (selectedPriorities) => {
    onFilterChange({ ...filters, priority: selectedPriorities });
  };

  const handleDateRangeChange = (dateRange) => {
    onFilterChange({
      ...filters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filter & Search Tasks</h3>
      </div>

      {/* Search Bar */}
      <div className="filter-panel-section">
        <label className="filter-label">Search:</label>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-input search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="search-clear-button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-panel-section">
        <div className="filter-controls-grid">
          <MultiSelectDropdown
            label="Status"
            options={statusOptions}
            selectedValues={filters.status || []}
            onChange={handleStatusChange}
            placeholder="All Statuses"
          />

          <MultiSelectDropdown
            label="Priority"
            options={priorityOptions}
            selectedValues={filters.priority || []}
            onChange={handlePriorityChange}
            placeholder="All Priorities"
          />

          <DateRangePicker
            label="Due Date Range"
            startDate={filters.startDate || ""}
            endDate={filters.endDate || ""}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>

      {/* Active Filter Tags */}
      <FilterTags
        filters={filters}
        searchQuery={searchQuery}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAll}
      />
    </div>
  );
}

