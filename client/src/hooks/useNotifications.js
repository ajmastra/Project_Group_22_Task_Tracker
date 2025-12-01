import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import notificationService from "../services/notificationService";

const POLL_INTERVAL = 30000; // 30 seconds
const TOAST_DURATION = 5000; // 5 seconds

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const previousUnreadCountRef = useRef(0);
  const previousNotificationIdsRef = useRef(new Set());

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications({
        limit: 50,
      });

      if (response.success) {
        const newNotifications = response.data.notifications || [];
        const newUnreadCount = response.unread_count || 0;

        // Check for new notifications to show as toasts
        // Only show toasts after initial load (when we have previous notifications)
        if (enabled && previousNotificationIdsRef.current.size > 0) {
          const newNotificationIds = new Set(
            newNotifications.map((n) => n.id)
          );
          const newNotificationsList = newNotifications.filter(
            (n) => !previousNotificationIdsRef.current.has(n.id)
          );

          // Show toast for new important notifications (assignment, completion)
          newNotificationsList.forEach((notification) => {
            if (
              notification.type === "assignment" ||
              notification.type === "completion"
            ) {
              addToast(notification);
            }
          });
        }

        // Update previous notification IDs (initialize on first load)
        if (previousNotificationIdsRef.current.size === 0) {
          previousNotificationIdsRef.current = new Set(
            newNotifications.map((n) => n.id)
          );
        } else {
          previousNotificationIdsRef.current = new Set(
            newNotifications.map((n) => n.id)
          );
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
        previousUnreadCountRef.current = newUnreadCount;
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const addToast = (notification) => {
    const toastId = `toast-${notification.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...notification, id: toastId }]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(toastId);
    }, TOAST_DURATION);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  };

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_status: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_status: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const notification = notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.read_status;
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, [notifications]);

  const handleNotificationClick = useCallback(
    (notification) => {
      if (notification.task_id) {
        navigate(`/tasks/${notification.task_id}`);
      }
    },
    [navigate]
  );

  // Initial load
  useEffect(() => {
    if (enabled) {
      loadNotifications();
    }
  }, [enabled, loadNotifications]);

  // Polling for real-time updates
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      loadNotifications();
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [enabled, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    toasts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
    refreshNotifications: loadNotifications,
    removeToast,
  };
}

