import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createNotification,
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from "../services/notificationService";

const POLL_INTERVAL = 5000;

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      setNotifications(await getNotifications());
      setError("");
    } catch (err) {
      console.error("Notification fetch error:", err);
      setError(err.message || "Notifications fetch failed");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);
    const interval = window.setInterval(() => fetchNotifications(false), POLL_INTERVAL);
    const unsubscribe = subscribeToNotifications(() => fetchNotifications(false));

    return () => {
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const markRead = useCallback(async (id) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error(err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error(err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const remove = useCallback(async (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await deleteAllNotifications();
    } catch (err) {
      console.error(err);
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const add = useCallback(async (payload) => {
    const notification = await createNotification(payload);
    setNotifications((current) => [notification, ...current]);
    return notification;
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: () => fetchNotifications(true),
    markRead,
    markAllRead,
    remove,
    clearAll,
    add,
  };
}
