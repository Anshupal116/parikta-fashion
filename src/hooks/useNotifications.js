import { useCallback, useEffect, useMemo, useState } from "react";
import { createNotification, deleteAllNotifications, deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead, resetDemoNotifications, subscribeToNotifications } from "../services/notificationService";

export default function useNotifications() {
  const [notifications, setNotifications] = useState(() => getNotifications());
  useEffect(() => subscribeToNotifications(setNotifications), []);
  const unreadCount = useMemo(() => notifications.filter(item => !item.read).length, [notifications]);
  return {
    notifications,
    unreadCount,
    markRead: useCallback((id, read = true) => setNotifications(markNotificationRead(id, read)), []),
    markAllRead: useCallback(() => setNotifications(markAllNotificationsRead()), []),
    remove: useCallback(id => setNotifications(deleteNotification(id)), []),
    clearAll: useCallback(() => setNotifications(deleteAllNotifications()), []),
    add: useCallback(payload => setNotifications(createNotification(payload)), []),
    resetDemo: useCallback(() => setNotifications(resetDemoNotifications()), []),
  };
}
