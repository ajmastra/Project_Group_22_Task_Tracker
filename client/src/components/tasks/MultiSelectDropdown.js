import React, { useState, useRef, useEffect } from "react";

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === options.length) {
      return "All selected";
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0]);
      return option ? option.label : selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <label className="filter-label">{label}:</label>
      <div
        className={`multi-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="multi-select-text">{getDisplayText()}</span>
        <span className="multi-select-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="multi-select-menu">
          <div className="multi-select-option multi-select-header">
            <label className="multi-select-checkbox-label">
              <input
                type="checkbox"
                checked={selectedValues.length === options.length}
                onChange={handleSelectAll}
                className="multi-select-checkbox"
              />
              <span>Select All</span>
            </label>
          </div>
          <div className="multi-select-options-list">
            {options.map((option) => (
              <div
                key={option.value}
                className="multi-select-option"
                onClick={() => handleToggle(option.value)}
              >
                <label className="multi-select-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleToggle(option.value)}
                    className="multi-select-checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

