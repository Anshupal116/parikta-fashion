const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const EVENT_NAME = "parikta-notifications-updated";

const normalize = (item) => ({
  ...item,
  id: item._id || item.id,
  reference: item.referenceId || item.reference || "",
});

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

const emitUpdate = () => window.dispatchEvent(new Event(EVENT_NAME));

export async function getNotifications() {
  const data = await request("/notifications");
  const list = data.notifications || data || [];
  return Array.isArray(list) ? list.map(normalize) : [];
}

export async function createNotification(payload) {
  const data = await request("/notifications", {
    method: "POST",
    body: JSON.stringify({
      type: payload.type || "system",
      title: payload.title || "New notification",
      message: payload.message || "",
      referenceId: payload.reference || payload.referenceId || "",
      actionUrl: payload.actionUrl || "",
      priority: payload.priority || "normal",
      read: Boolean(payload.read),
    }),
  });

  emitUpdate();
  return normalize(data.notification || data);
}

export async function markNotificationRead(id) {
  await request(`/notifications/${id}/read`, { method: "PATCH" });
  emitUpdate();
}

export async function markAllNotificationsRead() {
  await request("/notifications/read-all", { method: "PATCH" });
  emitUpdate();
}

export async function deleteNotification(id) {
  await request(`/notifications/${id}`, { method: "DELETE" });
  emitUpdate();
}

export async function deleteAllNotifications() {
  const notifications = await getNotifications();
  await Promise.all(
    notifications.map((item) =>
      request(`/notifications/${item.id}`, { method: "DELETE" })
    )
  );
  emitUpdate();
}

export function subscribeToNotifications(callback) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
