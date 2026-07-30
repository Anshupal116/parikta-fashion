import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";

const icons = { order:"🛒", payment:"💳", inventory:"📦", review:"⭐", customer:"👤", system:"⚙️", contact:"📩", newsletter:"📧", coupon:"🎁", customOrder:"👗" };
const ago = value => {
  const s = Math.max(1, Math.floor((Date.now()-new Date(value).getTime())/1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s/60)} min ago`;
  if (s < 86400) return `${Math.floor(s/3600)} hr ago`;
  return `${Math.floor(s/86400)} day ago`;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const openItem = item => {
    markRead(item.id, true);
    setOpen(false);
    if (item.actionUrl) navigate(item.actionUrl);
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)} className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadbd4] bg-white text-xl shadow-sm">
        🔔
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#9A3F4D] px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-[500] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-[#eadbd4] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#f1e6e1] px-5 py-4">
            <div><h3 className="font-bold text-[#5B3B32]">Notifications</h3><p className="mt-1 text-xs text-[#8b746b]">{unreadCount} unread</p></div>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs font-bold text-[#9A3F4D]">Mark all read</button>}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.slice(0,6).length ? notifications.slice(0,6).map(item => (
              <button key={item.id} onClick={() => openItem(item)} className={`flex w-full gap-3 border-b border-[#f6eeea] px-5 py-4 text-left hover:bg-[#fff9f6] ${item.read ? "bg-white" : "bg-[#fff5f1]"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FDEAE6] text-lg">{icons[item.type] || "🔔"}</div>
                <div className="min-w-0 flex-1"><div className="flex gap-2"><p className="line-clamp-1 flex-1 text-sm font-bold text-[#5B3B32]">{item.title}</p>{!item.read && <span className="mt-1 h-2 w-2 rounded-full bg-[#9A3F4D]" />}</div><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8b746b]">{item.message}</p><p className="mt-2 text-[11px] font-semibold text-[#b0988e]">{ago(item.createdAt)}</p></div>
              </button>
            )) : <div className="px-6 py-12 text-center text-[#8b746b]">No notifications</div>}
          </div>
          <button onClick={() => { setOpen(false); navigate("/admin-dashboard/notifications"); }} className="w-full bg-[#5B3B32] px-5 py-4 text-sm font-bold text-white">View All Notifications</button>
        </div>
      )}
    </div>
  );
}
