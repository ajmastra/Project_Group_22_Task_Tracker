import React from "react";

export default function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  onRefresh,
  onClose,
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment":
        return "📋";
      case "update":
        return "✏️";
      case "completion":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "assignment":
        return "#667eea";
      case "update":
        return "#f57c00";
      case "completion":
        return "#388e3c";
      case "info":
      default:
        return "#2196f3";
    }
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (!notification.read_status && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <h3 className="notification-panel-title">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h3>
        <div className="notification-panel-actions">
          {unreadCount > 0 && (
            <button
              className="notification-action-button"
              onClick={onMarkAllAsRead}
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          <button
            className="notification-action-button"
            onClick={onRefresh}
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="notification-panel-content">
        {!notifications || notifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  !notification.read_status ? "unread" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className="notification-type-indicator"
                  style={{ backgroundColor: getTypeColor(notification.type) }}
                >
                  {getTypeIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  {notification.task_title && (
                    <div className="notification-task">
                      Task: {notification.task_title}
                    </div>
                  )}
                  <div className="notification-meta">
                    <span className="notification-time">
                      {formatDate(notification.created_at)}
                    </span>
                    <span className="notification-type-badge">
                      {notification.type}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.read_status && (
                    <button
                      className="notification-mark-read-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onMarkAsRead) {
                          onMarkAsRead(notification.id);
                        }
                      }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="notification-delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) {
                        onDelete(notification.id);
                      }
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

