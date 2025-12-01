// src/components/layout/Navbar.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import ToastContainer from "../notifications/ToastContainer";
import DarkModeToggle from "../common/DarkModeToggle";
import { useNotifications } from "../../hooks/useNotifications";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const {
    notifications,
    unreadCount,
    toasts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
    refreshNotifications,
    removeToast,
  } = useNotifications(token ? true : false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          {token && <Link to="/tasks" className="navbar-link">Tasks</Link>}
          {token && <Link to="/analytics" className="navbar-link">Analytics</Link>}
          {token && <Link to="/profile" className="navbar-link">Profile</Link>}
        </div>

        <div className="navbar-links">
          {token ? (
            <>
              <DarkModeToggle />
              <NotificationBell
                unreadCount={unreadCount}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onNotificationClick={handleNotificationClick}
                onRefresh={refreshNotifications}
              />
              <span className="navbar-user">Hi, {user?.first_name || user?.email || "User"}</span>
              <button onClick={logout} className="navbar-button">Logout</button>
            </>
          ) : (
            <>
              <DarkModeToggle />
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link">Register</Link>
            </>
          )}
        </div>
      </nav>
      {token && <ToastContainer toasts={toasts} onClose={removeToast} />}
    </>
  );
}
