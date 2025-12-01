import React from "react";

export default function DateRangePicker({ label, startDate, endDate, onChange }) {
  const handleStartDateChange = (e) => {
    onChange({ startDate: e.target.value, endDate });
  };

  const handleEndDateChange = (e) => {
    onChange({ startDate, endDate: e.target.value });
  };

  const handleClear = () => {
    onChange({ startDate: "", endDate: "" });
  };

  return (
    <div className="date-range-picker">
      <label className="filter-label">{label}:</label>
      <div className="date-range-inputs">
        <div className="date-input-group">
          <label className="date-input-label">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="filter-input date-input"
            placeholder="Start date"
          />
        </div>
        <div className="date-input-group">
          <label className="date-input-label">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="filter-input date-input"
            placeholder="End date"
            min={startDate || undefined}
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="date-range-clear"
            title="Clear date range"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

