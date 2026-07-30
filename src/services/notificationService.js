const STORAGE_KEY = "parikta_admin_notifications_v1";
const EVENT_NAME = "parikta-notifications-updated";

const demoNotifications = [
  { id: "n1", type: "order", title: "New order received", message: "Order #PKT-1048 placed for ₹3,499.", reference: "PKT-1048", actionUrl: "/admin-dashboard/orders", createdAt: new Date(Date.now()-120000).toISOString(), read: false, priority: "high" },
  { id: "n2", type: "payment", title: "Payment successful", message: "Payment received for order #PKT-1048.", reference: "PKT-1048", actionUrl: "/admin-dashboard/orders", createdAt: new Date(Date.now()-1080000).toISOString(), read: false, priority: "normal" },
  { id: "n3", type: "inventory", title: "Low stock alert", message: "Rose Pink Kurti has only 3 units left.", reference: "SKU-PKT-203", actionUrl: "/admin-dashboard/products", createdAt: new Date(Date.now()-3600000).toISOString(), read: false, priority: "high" },
  { id: "n4", type: "review", title: "New 5-star review", message: "Riya Sharma reviewed Ivory Festive Suit Set.", reference: "Review #R-441", actionUrl: "/admin-dashboard/reviews", createdAt: new Date(Date.now()-14400000).toISOString(), read: true, priority: "normal" },
  { id: "n5", type: "customer", title: "New customer registered", message: "Neha Verma created a customer account.", reference: "Customer #C-718", actionUrl: "/admin-dashboard/customers", createdAt: new Date(Date.now()-28800000).toISOString(), read: true, priority: "low" },
  { id: "n6", type: "system", title: "Homepage updated", message: "Homepage CMS changes were saved successfully.", reference: "Homepage CMS", actionUrl: "/admin-dashboard/homepage-cms", createdAt: new Date(Date.now()-93600000).toISOString(), read: true, priority: "low" }
];

const emit = (notifications) => window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: notifications }));

export function getNotifications() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(value)) return value;
  } catch (error) {
    console.error("Notification storage error", error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoNotifications));
  return demoNotifications;
}

export function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  emit(notifications);
  return notifications;
}

export function createNotification(payload) {
  const notification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: payload.type || "system",
    title: payload.title || "New notification",
    message: payload.message || "",
    reference: payload.reference || "",
    actionUrl: payload.actionUrl || "",
    createdAt: payload.createdAt || new Date().toISOString(),
    read: Boolean(payload.read),
    priority: payload.priority || "normal",
  };
  return saveNotifications([notification, ...getNotifications()]);
}

export const markNotificationRead = (id, read = true) => saveNotifications(getNotifications().map(item => item.id === id ? { ...item, read } : item));
export const markAllNotificationsRead = () => saveNotifications(getNotifications().map(item => ({ ...item, read: true })));
export const deleteNotification = (id) => saveNotifications(getNotifications().filter(item => item.id !== id));
export const deleteAllNotifications = () => saveNotifications([]);
export const resetDemoNotifications = () => saveNotifications([...demoNotifications]);

export function subscribeToNotifications(callback) {
  const custom = event => callback(event.detail || getNotifications());
  const storage = event => event.key === STORAGE_KEY && callback(getNotifications());
  window.addEventListener(EVENT_NAME, custom);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(EVENT_NAME, custom);
    window.removeEventListener("storage", storage);
  };
}
