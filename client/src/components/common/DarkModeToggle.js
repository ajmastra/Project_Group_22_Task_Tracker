import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <button
      className="dark-mode-toggle"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}

