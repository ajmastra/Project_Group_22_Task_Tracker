import React, { useEffect, useState } from "react";

export default function ToastNotification({ notification, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  const getTypeStyles = (type) => {
    switch (type) {
      case "assignment":
        return {
          backgroundColor: "#667eea",
          icon: "📋",
        };
      case "update":
        return {
          backgroundColor: "#f57c00",
          icon: "✏️",
        };
      case "completion":
        return {
          backgroundColor: "#388e3c",
          icon: "✅",
        };
      case "info":
      default:
        return {
          backgroundColor: "#2196f3",
          icon: "ℹ️",
        };
    }
  };

  const styles = getTypeStyles(notification.type);

  return (
    <div
      className={`toast-notification ${isExiting ? "exiting" : ""}`}
      style={{ borderLeftColor: styles.backgroundColor }}
    >
      <div className="toast-notification-content">
        <div className="toast-notification-icon">{styles.icon}</div>
        <div className="toast-notification-text">
          <div className="toast-notification-message">{notification.message}</div>
          {notification.task_title && (
            <div className="toast-notification-task">
              {notification.task_title}
            </div>
          )}
        </div>
      </div>
      <button
        className="toast-notification-close"
        onClick={handleClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

