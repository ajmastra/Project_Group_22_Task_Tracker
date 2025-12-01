import React, { useState, useRef, useEffect } from "react";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell({ unreadCount, notifications, onMarkAsRead, onMarkAllAsRead, onDelete, onNotificationClick, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button
        className="notification-bell-button"
        onClick={togglePanel}
        aria-label="Notifications"
      >
        <svg
          className="notification-bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onDelete={onDelete}
          onNotificationClick={onNotificationClick}
          onRefresh={onRefresh}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

