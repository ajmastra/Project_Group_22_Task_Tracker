import React from "react";

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  const getTypeStyles = (type) => {
    switch (type) {
      case "assignment":
        return {
          borderColor: "#667eea",
          icon: "📋",
        };
      case "update":
        return {
          borderColor: "#f57c00",
          icon: "✏️",
        };
      case "completion":
        return {
          borderColor: "#388e3c",
          icon: "✅",
        };
      case "info":
      default:
        return {
          borderColor: "#2196f3",
          icon: "ℹ️",
        };
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const styles = getTypeStyles(toast.type);
        return (
          <div
            key={toast.id}
            className="toast-notification-wrapper"
          >
            <div
              className={`toast-notification ${
                toast.type === "assignment"
                  ? "toast-assignment"
                  : toast.type === "completion"
                  ? "toast-completion"
                  : "toast-info"
              }`}
              style={{ borderLeftColor: styles.borderColor }}
            >
              <div className="toast-notification-content">
                <div className="toast-notification-icon">{styles.icon}</div>
                <div className="toast-notification-text">
                  <div className="toast-notification-message">
                    {toast.message}
                  </div>
                  {toast.task_title && (
                    <div className="toast-notification-task">
                      {toast.task_title}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="toast-notification-close"
                onClick={() => onClose(toast.id)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

