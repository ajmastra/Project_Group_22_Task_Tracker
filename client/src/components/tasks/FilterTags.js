import React from "react";

export default function FilterTags({ filters, searchQuery, onRemoveFilter, onClearAll }) {
  const activeFilters = [];

  // Add status filters
  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((status) => {
      activeFilters.push({
        type: "status",
        value: status,
        label: `Status: ${status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}`,
      });
    });
  }

  // Add priority filters
  if (filters.priority && filters.priority.length > 0) {
    filters.priority.forEach((priority) => {
      activeFilters.push({
        type: "priority",
        value: priority,
        label: `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
      });
    });
  }

  // Add date range filter
  if (filters.startDate || filters.endDate) {
    const dateLabel = filters.startDate && filters.endDate
      ? `Due: ${filters.startDate} to ${filters.endDate}`
      : filters.startDate
      ? `Due: from ${filters.startDate}`
      : `Due: until ${filters.endDate}`;
    activeFilters.push({
      type: "dateRange",
      value: "dateRange",
      label: dateLabel,
    });
  }

  // Add search query
  if (searchQuery) {
    activeFilters.push({
      type: "search",
      value: searchQuery,
      label: `Search: "${searchQuery}"`,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="filter-tags-container">
      <div className="filter-tags-label">Active Filters:</div>
      <div className="filter-tags">
        {activeFilters.map((filter, index) => (
          <span key={`${filter.type}-${filter.value}-${index}`} className="filter-tag">
            <span className="filter-tag-text">{filter.label}</span>
            <button
              type="button"
              className="filter-tag-remove"
              onClick={() => onRemoveFilter(filter.type, filter.value)}
              aria-label={`Remove ${filter.label} filter`}
            >
              ✕
            </button>
          </span>
        ))}
        {activeFilters.length > 1 && (
          <button
            type="button"
            className="filter-tag-clear-all"
            onClick={onClearAll}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

