import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";

const meta = {
  order:{label:"Orders",icon:"🛒",chip:"bg-blue-100 text-blue-700"}, payment:{label:"Payments",icon:"💳",chip:"bg-emerald-100 text-emerald-700"}, inventory:{label:"Inventory",icon:"📦",chip:"bg-amber-100 text-amber-700"}, review:{label:"Reviews",icon:"⭐",chip:"bg-yellow-100 text-yellow-700"}, customer:{label:"Customers",icon:"👤",chip:"bg-violet-100 text-violet-700"}, customOrder:{label:"Custom Orders",icon:"👗",chip:"bg-pink-100 text-pink-700"}, contact:{label:"Contact",icon:"📩",chip:"bg-cyan-100 text-cyan-700"}, newsletter:{label:"Newsletter",icon:"📧",chip:"bg-indigo-100 text-indigo-700"}, coupon:{label:"Coupons",icon:"🎁",chip:"bg-rose-100 text-rose-700"}, system:{label:"System",icon:"⚙️",chip:"bg-gray-100 text-gray-700"}
};
const tabs = ["all","order","payment","inventory","review","customer","system"];
const ago = (value) => { const t=new Date(value).getTime(); if(Number.isNaN(t))return""; const s=Math.max(1,Math.floor((Date.now()-t)/1000)); if(s<60)return"Just now"; if(s<3600)return`${Math.floor(s/60)} minutes ago`; if(s<86400)return`${Math.floor(s/3600)} hours ago`; return`${Math.floor(s/86400)} days ago`; };

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead, remove, clearAll, add } = useNotifications();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => notifications.filter((item) => {
    const q = search.toLowerCase().trim();
    const text = `${item.title} ${item.message} ${item.reference || ""}`.toLowerCase();
    return (type === "all" || item.type === type) && (status === "all" || (status === "unread" ? !item.read : item.read)) && (!q || text.includes(q));
  }), [notifications, type, status, search]);

  const today = notifications.filter((n) => new Date(n.createdAt).toDateString() === new Date().toDateString()).length;
  const high = notifications.filter((n) => n.priority === "high").length;
  const openAction = async (item) => { if (!item.read) await markRead(item.id); if (item.actionUrl) navigate(item.actionUrl); };
  const clear = async () => { if (window.confirm("Saari notifications permanently delete karni hain?")) await clearAll(); };

  return (
    <div className="pb-20">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#BFA996]">Admin Communication</p><h1 className="heading-font mt-2 text-4xl text-[#5B3B32] md:text-5xl">Notification Center</h1><p className="mt-2 text-[#8b746b]">Real MongoDB notifications manage karo.</p></div>
        <div className="flex flex-wrap gap-3"><button onClick={() => setShowCreate(true)} className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]">+ Test Notification</button><button onClick={refresh} className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]">Refresh</button><button onClick={markAllRead} disabled={!unreadCount} className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32] disabled:opacity-40">Mark All Read</button><button onClick={clear} disabled={!notifications.length} className="rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white disabled:opacity-40">Clear All</button></div>
      </div>

      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Total" value={notifications.length} icon="🔔"/><Stat label="Unread" value={unreadCount} icon="🔴"/><Stat label="Today" value={today} icon="📅"/><Stat label="High Priority" value={high} icon="⚠️"/></div>

      <div className="mt-8 rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-sm"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex gap-2 overflow-x-auto">{tabs.map((tab) => <button key={tab} onClick={() => setType(tab)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${type === tab ? "bg-[#9A3F4D] text-white" : "border border-[#eadbd4] bg-white text-[#5B3B32]"}`}>{tab === "all" ? "All" : meta[tab]?.label}</button>)}</div><div className="flex flex-col gap-3 sm:flex-row"><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#eadbd4] bg-white px-4 py-3 text-sm font-semibold text-[#5B3B32]"><option value="all">All Status</option><option value="unread">Unread Only</option><option value="read">Read Only</option></select><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications..." className="min-w-[240px] rounded-xl border border-[#eadbd4] bg-white px-4 py-3 text-sm outline-none"/></div></div></div>

      <div className="mt-6 space-y-4">
        {loading && !notifications.length ? <div className="rounded-3xl border border-[#eadbd4] bg-white px-6 py-16 text-center text-[#8b746b]">Loading notifications...</div> : filtered.length ? filtered.map((item) => { const m=meta[item.type]||meta.system; return <article key={item.id} className={`rounded-3xl border p-5 shadow-sm ${item.read ? "border-[#eadbd4] bg-white" : "border-[#e5c5bd] bg-[#fff8f5]"}`}><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDEAE6] text-2xl">{m.icon}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-[#5B3B32]">{item.title}</h3>{!item.read&&<span className="rounded-full bg-[#9A3F4D] px-2.5 py-1 text-[10px] font-bold text-white">NEW</span>}{item.priority==="high"&&<span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">HIGH</span>}</div><p className="mt-2 text-sm leading-6 text-[#7f6a62]">{item.message}</p><div className="mt-3 flex flex-wrap gap-3 text-xs"><span className={`rounded-full px-3 py-1 font-bold ${m.chip}`}>{m.label}</span>{item.reference&&<span className="font-semibold text-[#9a837a]">{item.reference}</span>}<span className="text-[#b0988e]">{ago(item.createdAt)}</span></div></div></div><div className="flex flex-wrap gap-2">{item.actionUrl&&<button onClick={()=>openAction(item)} className="rounded-xl bg-[#5B3B32] px-4 py-2.5 text-xs font-bold text-white">Open</button>}{!item.read&&<button onClick={()=>markRead(item.id)} className="rounded-xl border border-[#eadbd4] bg-white px-4 py-2.5 text-xs font-bold text-[#5B3B32]">Mark Read</button>}<button onClick={()=>remove(item.id)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">Delete</button></div></div></article> }) : <div className="rounded-3xl border border-dashed border-[#d9c6bd] bg-[#fffaf7] px-6 py-16 text-center"><div className="text-5xl">🔕</div><h3 className="heading-font mt-4 text-3xl text-[#5B3B32]">No notifications found</h3>{notifications.length>0&&<button onClick={()=>{setType("all");setStatus("all");setSearch("");}} className="mt-6 rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white">Reset Filters</button>}</div>}
      </div>

      {showCreate && <CreateModal onClose={()=>setShowCreate(false)} onCreate={async(payload)=>{await add(payload);setShowCreate(false);}}/>}
    </div>
  );
}

function Stat({label,value,icon}){return <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm"><div className="flex justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a837a]">{label}</p><p className="heading-font mt-3 text-4xl text-[#5B3B32]">{value}</p></div><span className="text-2xl">{icon}</span></div></div>}

function CreateModal({onClose,onCreate}){const[form,setForm]=useState({type:"order",title:"New test notification",message:"This is a test notification from Parikta admin panel.",reference:"Test",actionUrl:"/admin-dashboard/orders",priority:"normal"});const[saving,setSaving]=useState(false);const[error,setError]=useState("");const change=(e)=>setForm({...form,[e.target.name]:e.target.value});const submit=async(e)=>{e.preventDefault();try{setSaving(true);setError("");await onCreate(form);}catch(err){setError(err.message||"Notification create failed");setSaving(false);}};return <div className="fixed inset-0 z-[950] flex items-center justify-center p-4"><button type="button" onClick={onClose} className="absolute inset-0 bg-black/40"/><form onSubmit={submit} className="relative w-full max-w-2xl rounded-3xl bg-[#fffaf7] p-8 shadow-2xl"><div className="flex justify-between"><h2 className="heading-font text-3xl text-[#5B3B32]">Create Test Notification</h2><button type="button" onClick={onClose}>✕</button></div>{error&&<div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-2"><select name="type" value={form.type} onChange={change} className="rounded-xl border bg-white px-4 py-3">{Object.entries(meta).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select><select name="priority" value={form.priority} onChange={change} className="rounded-xl border bg-white px-4 py-3"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select><input name="title" value={form.title} onChange={change} required className="rounded-xl border bg-white px-4 py-3 md:col-span-2"/><textarea name="message" value={form.message} onChange={change} required rows="4" className="rounded-xl border bg-white px-4 py-3 md:col-span-2"/><input name="reference" value={form.reference} onChange={change} className="rounded-xl border bg-white px-4 py-3"/><input name="actionUrl" value={form.actionUrl} onChange={change} className="rounded-xl border bg-white px-4 py-3"/></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border bg-white px-5 py-3">Cancel</button><button disabled={saving} className="rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Creating...":"Create"}</button></div></form></div>}
