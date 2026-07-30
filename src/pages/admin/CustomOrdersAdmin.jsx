import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFilter,
  FiImage,
  FiRefreshCw,
  FiSearch,
  FiScissors,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

const STORAGE_KEY = "parikta_custom_orders";
const STATUSES = ["New","Contacted","Quoted","Confirmed","In Progress","Ready","Completed","Rejected","Cancelled"];
const PRIORITIES = ["Low","Medium","High","Urgent"];
const PAGE_SIZES = [8,12,20,50];

const seedOrders = [
  {
    id:"PCO1001",customer:"Ananya Sharma",phone:"9876543210",
    email:"ananya@example.com",dressType:"Lehenga",fabric:"Silk",
    color:"Maroon",budget:"₹8,000 - ₹12,000",
    notes:"Wedding function ke liye heavy embroidery lehenga chahiye.",
    image:"",status:"New",priority:"High",tailor:"",
    deliveryDate:"",createdAt:"2026-06-23T10:30:00.000Z",
    measurements:{bust:"",waist:"",hip:"",shoulder:"",height:"",sleeve:""},
    timeline:[{status:"New",note:"Custom request received",date:"2026-06-23T10:30:00.000Z"}],
  },
  {
    id:"PCO1002",customer:"Megha Verma",phone:"9876500000",
    email:"megha@example.com",dressType:"Suit",fabric:"Georgette",
    color:"Pink",budget:"₹3,000 - ₹5,000",
    notes:"Simple elegant party wear suit with dupatta.",
    image:"",status:"In Progress",priority:"Medium",tailor:"Rakesh",
    deliveryDate:"2026-07-05",createdAt:"2026-06-22T09:15:00.000Z",
    measurements:{bust:"36",waist:"30",hip:"38",shoulder:"14",height:"60",sleeve:"18"},
    timeline:[
      {status:"New",note:"Custom request received",date:"2026-06-22T09:15:00.000Z"},
      {status:"In Progress",note:"Tailor assigned and stitching started",date:"2026-06-25T09:15:00.000Z"},
    ],
  },
];

const parse = (value, fallback=[]) => {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
};

const formatDate = (value, withTime=false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", withTime
    ? {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}
    : {day:"2-digit",month:"short",year:"numeric"});
};

const statusClass = (status) => ({
  New:"bg-sky-50 text-sky-700 border-sky-200",
  Contacted:"bg-indigo-50 text-indigo-700 border-indigo-200",
  Quoted:"bg-violet-50 text-violet-700 border-violet-200",
  Confirmed:"bg-blue-50 text-blue-700 border-blue-200",
  "In Progress":"bg-amber-50 text-amber-700 border-amber-200",
  Ready:"bg-teal-50 text-teal-700 border-teal-200",
  Completed:"bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected:"bg-rose-50 text-rose-700 border-rose-200",
  Cancelled:"bg-slate-100 text-slate-700 border-slate-200",
}[status] || "bg-slate-50 text-slate-700 border-slate-200");

const priorityClass = (priority) => ({
  Low:"bg-slate-50 text-slate-600 border-slate-200",
  Medium:"bg-sky-50 text-sky-700 border-sky-200",
  High:"bg-orange-50 text-orange-700 border-orange-200",
  Urgent:"bg-rose-50 text-rose-700 border-rose-200",
}[priority] || "bg-slate-50 text-slate-700 border-slate-200");

function StatCard({icon,label,value,helper}) {
  return (
    <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b746b]">{label}</p>
          <h2 className="heading-font mt-3 text-3xl text-[#5B3B32] md:text-4xl">{value}</h2>
          {helper && <p className="mt-2 text-xs text-[#8b746b]">{helper}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDEAE6] text-[#9A3F4D]">{icon}</div>
      </div>
    </div>
  );
}

function CustomOrdersAdmin() {
  const [orders,setOrders] = useState([]);
  const [selected,setSelected] = useState(null);
  const [editing,setEditing] = useState(null);
  const [search,setSearch] = useState("");
  const [statusFilter,setStatusFilter] = useState("All");
  const [dressFilter,setDressFilter] = useState("All");
  const [priorityFilter,setPriorityFilter] = useState("All");
  const [page,setPage] = useState(1);
  const [pageSize,setPageSize] = useState(8);
  const [refreshing,setRefreshing] = useState(false);

  const loadOrders = () => {
    const saved = parse(localStorage.getItem(STORAGE_KEY));
    const data = Array.isArray(saved) && saved.length ? saved : seedOrders;
    setOrders(data);
    if (!saved.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => { loadOrders(); }, []);

  const persist = (data) => {
    setOrders(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const updateStatus = (id,status) => {
    const updated = orders.map(order => order.id !== id ? order : {
      ...order,status,
      timeline:[...(order.timeline || []),{
        status,note:`Status changed to ${status}`,date:new Date().toISOString()
      }]
    });
    persist(updated);
    setSelected(current => current?.id === id ? updated.find(o => o.id === id) : current);
  };

  const removeOrder = (order) => {
    if (!window.confirm(`Request ${order.id} permanently delete karna hai?`)) return;
    const updated = orders.filter(item => item.id !== order.id);
    persist(updated);
    if (selected?.id === order.id) setSelected(null);
  };

  const saveChanges = () => {
    if (!editing?.id) return;
    const updated = orders.map(order => order.id !== editing.id ? order : {
      ...editing,
      timeline:[...(editing.timeline || []),{
        status:editing.status,note:"Order details, measurements or assignment updated",
        date:new Date().toISOString()
      }]
    });
    persist(updated);
    setSelected(updated.find(o => o.id === editing.id) || null);
    setEditing(null);
  };

  const dressTypes = useMemo(() =>
    [...new Set(orders.map(o => o.dressType).filter(Boolean))].sort(), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(order => {
      const matchesSearch = !q || [
        order.id,order.customer,order.phone,order.email,
        order.dressType,order.fabric,order.color
      ].some(value => String(value || "").toLowerCase().includes(q));
      return matchesSearch &&
        (statusFilter === "All" || order.status === statusFilter) &&
        (dressFilter === "All" || order.dressType === dressFilter) &&
        (priorityFilter === "All" || (order.priority || "Medium") === priorityFilter);
    });
  },[orders,search,statusFilter,dressFilter,priorityFilter]);

  useEffect(() => { setPage(1); },[search,statusFilter,dressFilter,priorityFilter,pageSize]);

  const metrics = useMemo(() => ({
    total:orders.length,
    newCount:orders.filter(o => o.status === "New").length,
    active:orders.filter(o => ["Confirmed","In Progress","Ready"].includes(o.status)).length,
    completed:orders.filter(o => o.status === "Completed").length,
    urgent:orders.filter(o => o.priority === "Urgent").length,
  }),[orders]);

  const totalPages = Math.max(1,Math.ceil(filtered.length/pageSize));
  const paginated = filtered.slice((page-1)*pageSize,page*pageSize);

  useEffect(() => { if (page > totalPages) setPage(totalPages); },[page,totalPages]);

  const exportCsv = () => {
    if (!filtered.length) return window.alert("Export ke liye requests nahi hain");
    const rows = filtered.map(o => ({
      "Request ID":o.id,Customer:o.customer,Phone:o.phone,Email:o.email,
      Dress:o.dressType,Fabric:o.fabric,Colour:o.color,Budget:o.budget,
      Status:o.status,Priority:o.priority,Tailor:o.tailor,
      "Delivery Date":o.deliveryDate,Notes:o.notes
    }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","),...rows.map(row =>
      headers.map(h => `"${String(row[h] ?? "").replace(/"/g,'""')}"`).join(",")
    )].join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`],{type:"text/csv;charset=utf-8;"}));
    const link = document.createElement("a");
    link.href=url; link.download=`parikta-custom-orders-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  const openEditor = (order) => setEditing({
    ...order,
    measurements:{
      bust:order.measurements?.bust || "",waist:order.measurements?.waist || "",
      hip:order.measurements?.hip || "",shoulder:order.measurements?.shoulder || "",
      height:order.measurements?.height || "",sleeve:order.measurements?.sleeve || "",
    }
  });

  return (
    <div className="pb-10">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#BFA996]">Customisation Desk</p>
          <h1 className="heading-font mt-1 text-4xl text-[#5B3B32]">Custom Orders</h1>
          <p className="mt-2 text-[#8b746b]">Manage measurements, assignments, status and delivery timelines.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-2xl border border-[#9A3F4D] bg-white px-4 py-3 text-sm font-semibold text-[#9A3F4D]">
            <FiDownload/> Export CSV
          </button>
          <button onClick={() => {setRefreshing(true);loadOrders();setTimeout(()=>setRefreshing(false),500)}} disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl bg-[#9A3F4D] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            <FiRefreshCw className={refreshing ? "animate-spin" : ""}/> {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard icon={<FiScissors/>} label="Total Requests" value={metrics.total} helper={`${filtered.length} visible`}/>
        <StatCard icon={<FiUser/>} label="New" value={metrics.newCount}/>
        <StatCard icon={<FiEdit3/>} label="In Progress" value={metrics.active}/>
        <StatCard icon={<FiScissors/>} label="Completed" value={metrics.completed}/>
        <StatCard icon={<FiFilter/>} label="Urgent" value={metrics.urgent}/>
      </div>

      <section className="mb-6 rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#5B3B32]"><FiFilter/><h2 className="font-bold">Search & Filters</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative md:col-span-2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A3F4D]"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Request ID, customer, phone, dress..."
              className="w-full rounded-2xl border border-[#eadbd4] bg-white py-3 pl-11 pr-4 text-sm text-[#5B3B32] outline-none focus:border-[#9A3F4D]"/>
          </label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm">
            <option value="All">All Statuses</option>{STATUSES.map(x=><option key={x}>{x}</option>)}
          </select>
          <select value={dressFilter} onChange={e=>setDressFilter(e.target.value)} className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm">
            <option value="All">All Dress Types</option>{dressTypes.map(x=><option key={x}>{x}</option>)}
          </select>
          <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm">
            <option value="All">All Priorities</option>{PRIORITIES.map(x=><option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="mt-4 flex justify-between gap-3 text-sm">
          <p className="text-[#8b746b]">Showing <strong className="text-[#5B3B32]">{filtered.length}</strong> of <strong className="text-[#5B3B32]">{orders.length}</strong></p>
          <button onClick={()=>{setSearch("");setStatusFilter("All");setDressFilter("All");setPriorityFilter("All")}} className="font-semibold text-[#9A3F4D]">Clear filters</button>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>{["Request","Customer","Dress","Fabric / Colour","Budget","Priority","Tailor","Status","Action"].map(h=><th key={h} className="p-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map(order=>(
                <tr key={order.id} className="border-t border-[#eadbd4] text-[#5B3B32] hover:bg-[#fff7f3]">
                  <td className="p-4"><p className="font-bold text-[#9A3F4D]">{order.id}</p><p className="mt-1 text-xs text-[#8b746b]">{formatDate(order.createdAt)}</p></td>
                  <td className="p-4"><p className="font-semibold">{order.customer}</p><p className="mt-1 text-xs text-[#8b746b]">{order.phone}</p></td>
                  <td className="p-4 font-semibold">{order.dressType || "-"}</td>
                  <td className="p-4"><p>{order.fabric || "-"}</p><p className="mt-1 text-xs text-[#8b746b]">{order.color || "-"}</p></td>
                  <td className="p-4 font-semibold">{order.budget || "-"}</td>
                  <td className="p-4"><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${priorityClass(order.priority || "Medium")}`}>{order.priority || "Medium"}</span></td>
                  <td className="p-4">{order.tailor || "Not assigned"}</td>
                  <td className="min-w-[190px] p-4">
                    <select value={order.status || "New"} onChange={e=>updateStatus(order.id,e.target.value)}
                      className="w-full rounded-xl border border-[#eadbd4] bg-white px-3 py-2.5 text-sm">
                      {STATUSES.map(x=><option key={x}>{x}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={()=>setSelected(order)} className="flex items-center gap-2 rounded-xl bg-[#5B3B32] px-4 py-2.5 text-sm font-semibold text-white"><FiEye/>View</button>
                      <button onClick={()=>openEditor(order)} className="flex items-center gap-2 rounded-xl border border-[#9A3F4D] bg-white px-4 py-2.5 text-sm font-semibold text-[#9A3F4D]"><FiEdit3/>Edit</button>
                      <button onClick={()=>removeOrder(order)} className="rounded-xl bg-rose-500 px-3 py-2.5 text-white"><FiTrash2/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]"><FiScissors size={28}/></div>
            <h3 className="mt-5 text-2xl font-semibold text-[#5B3B32]">No Custom Requests Found</h3>
            <p className="mt-2 text-[#8b746b]">Search ya filters change karke dobara check karein.</p>
          </div>
        )}

        {!!filtered.length && (
          <div className="flex flex-col gap-4 border-t border-[#eadbd4] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8b746b]">Rows per page</span>
              <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="rounded-xl border border-[#eadbd4] bg-white px-3 py-2 text-sm">
                {PAGE_SIZES.map(x=><option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#8b746b]">Page <strong>{page}</strong> of <strong>{totalPages}</strong></p>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbd4] bg-white disabled:opacity-40"><FiChevronLeft/></button>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbd4] bg-white disabled:opacity-40"><FiChevronRight/></button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#fffaf7] shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#eadbd4] px-6 py-6 md:px-8">
              <div><p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">Custom Request</p><h2 className="heading-font mt-1 text-4xl text-[#5B3B32]">{selected.id}</h2><p className="mt-2 text-sm text-[#8b746b]">{formatDate(selected.createdAt,true)}</p></div>
              <div className="flex gap-3">
                <button onClick={()=>openEditor(selected)} className="flex items-center gap-2 rounded-xl bg-[#9A3F4D] px-4 py-3 font-semibold text-white"><FiEdit3/>Edit</button>
                <button onClick={()=>setSelected(null)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4]"><FiX/></button>
              </div>
            </header>

            <div className="space-y-6 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <div className="flex items-center gap-3"><FiUser className="text-[#9A3F4D]"/><h3 className="font-bold text-[#5B3B32]">Customer</h3></div>
                  <div className="mt-4 space-y-2 text-sm text-[#6d554d]"><p><strong>Name:</strong> {selected.customer || "-"}</p><p><strong>Phone:</strong> {selected.phone || "-"}</p><p><strong>Email:</strong> {selected.email || "-"}</p></div>
                </section>
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <div className="flex items-center gap-3"><FiScissors className="text-[#9A3F4D]"/><h3 className="font-bold text-[#5B3B32]">Design Request</h3></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    {[["Dress",selected.dressType],["Fabric",selected.fabric],["Colour",selected.color],["Budget",selected.budget]].map(([a,b])=><div key={a}><p className="text-[#8b746b]">{a}</p><p className="font-semibold text-[#5B3B32]">{b || "-"}</p></div>)}
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                <div className="flex items-center gap-3"><FiImage className="text-[#9A3F4D]"/><h3 className="font-bold text-[#5B3B32]">Reference & Notes</h3></div>
                <div className="mt-4 grid gap-5 md:grid-cols-[180px_1fr]">
                  <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-[#FDEAE6]">
                    {selected.image ? <img src={selected.image} alt="Reference" className="h-full w-full object-cover"/> : <div className="text-center text-[#9A3F4D]"><FiImage size={28} className="mx-auto"/><p className="mt-2 text-xs">No reference image</p></div>}
                  </div>
                  <p className="text-sm leading-7 text-[#6d554d]">{selected.notes || "No special notes."}</p>
                </div>
              </section>

              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">Measurements (inches)</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[["Bust","bust"],["Waist","waist"],["Hip","hip"],["Shoulder","shoulder"],["Height","height"],["Sleeve","sleeve"]].map(([label,key])=>
                      <div key={key} className="rounded-xl bg-[#f7f2ee] p-3"><p className="text-xs text-[#8b746b]">{label}</p><p className="mt-1 font-bold text-[#5B3B32]">{selected.measurements?.[key] || "-"}</p></div>
                    )}
                  </div>
                </section>
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">Assignment & Delivery</h3>
                  <div className="mt-4 space-y-3 text-sm text-[#6d554d]">
                    <div className="flex justify-between"><span>Tailor</span><strong>{selected.tailor || "Not assigned"}</strong></div>
                    <div className="flex justify-between"><span>Delivery Date</span><strong>{formatDate(selected.deliveryDate)}</strong></div>
                    <div className="flex justify-between"><span>Priority</span><span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(selected.priority || "Medium")}`}>{selected.priority || "Medium"}</span></div>
                    <div className="flex justify-between"><span>Status</span><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(selected.status)}`}>{selected.status}</span></div>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                <h3 className="font-bold text-[#5B3B32]">Timeline</h3>
                <div className="mt-5 space-y-4">
                  {(selected.timeline || []).length ? [...selected.timeline].reverse().map((item,index)=>
                    <div key={index} className="flex gap-4"><div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#9A3F4D]"/><div><p className="font-semibold text-[#5B3B32]">{item.status}</p><p className="mt-1 text-sm text-[#6d554d]">{item.note}</p><p className="mt-1 text-xs text-[#8b746b]">{formatDate(item.date,true)}</p></div></div>
                  ) : <p className="text-sm text-[#8b746b]">No timeline activity.</p>}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[#fffaf7] shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#eadbd4] px-6 py-6 md:px-8">
              <div><p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">Update Request</p><h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">{editing.id}</h2></div>
              <button onClick={()=>setEditing(null)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4]"><FiX/></button>
            </header>
            <div className="space-y-6 p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <label><span className="mb-2 block text-sm font-semibold text-[#5B3B32]">Tailor / Designer</span><input value={editing.tailor || ""} onChange={e=>setEditing({...editing,tailor:e.target.value})} className="w-full rounded-2xl border border-[#eadbd4] bg-white px-4 py-3"/></label>
                <label><span className="mb-2 block text-sm font-semibold text-[#5B3B32]">Delivery Date</span><input type="date" value={editing.deliveryDate || ""} onChange={e=>setEditing({...editing,deliveryDate:e.target.value})} className="w-full rounded-2xl border border-[#eadbd4] bg-white px-4 py-3"/></label>
                <label><span className="mb-2 block text-sm font-semibold text-[#5B3B32]">Priority</span><select value={editing.priority || "Medium"} onChange={e=>setEditing({...editing,priority:e.target.value})} className="w-full rounded-2xl border border-[#eadbd4] bg-white px-4 py-3">{PRIORITIES.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className="mb-2 block text-sm font-semibold text-[#5B3B32]">Status</span><select value={editing.status || "New"} onChange={e=>setEditing({...editing,status:e.target.value})} className="w-full rounded-2xl border border-[#eadbd4] bg-white px-4 py-3">{STATUSES.map(x=><option key={x}>{x}</option>)}</select></label>
              </div>
              <section>
                <h3 className="font-bold text-[#5B3B32]">Measurements (inches)</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[["Bust","bust"],["Waist","waist"],["Hip","hip"],["Shoulder","shoulder"],["Height","height"],["Sleeve","sleeve"]].map(([label,key])=>
                    <label key={key}><span className="mb-2 block text-sm text-[#8b746b]">{label}</span><input value={editing.measurements?.[key] || ""} onChange={e=>setEditing({...editing,measurements:{...editing.measurements,[key]:e.target.value}})} className="w-full rounded-2xl border border-[#eadbd4] bg-white px-4 py-3"/></label>
                  )}
                </div>
              </section>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-[#5B3B32]">Notes</span><textarea rows="5" value={editing.notes || ""} onChange={e=>setEditing({...editing,notes:e.target.value})} className="w-full rounded-2xl border border-[#eadbd4] bg-white px-4 py-3"/></label>
              <div className="flex justify-end gap-3 border-t border-[#eadbd4] pt-5">
                <button onClick={()=>setEditing(null)} className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]">Cancel</button>
                <button onClick={saveChanges} className="rounded-xl bg-[#9A3F4D] px-5 py-3 font-semibold text-white">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomOrdersAdmin;