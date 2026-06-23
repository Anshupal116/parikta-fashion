import { useEffect, useState } from "react";

const dummyCustomOrders = [
  {
    id: "PCO1001",
    customer: "Ananya Sharma",
    phone: "9876543210",
    dressType: "Lehenga",
    fabric: "Silk",
    color: "Maroon",
    budget: "₹8,000 - ₹12,000",
    notes: "Wedding function ke liye heavy embroidery lehenga chahiye.",
    image: "",
    status: "New",
    date: "23 Jun 2026",
  },
  {
    id: "PCO1002",
    customer: "Megha Verma",
    phone: "9876500000",
    dressType: "Suit",
    fabric: "Georgette",
    color: "Pink",
    budget: "₹3,000 - ₹5,000",
    notes: "Simple elegant party wear suit with dupatta.",
    image: "",
    status: "In Progress",
    date: "22 Jun 2026",
  },
];

function CustomOrdersAdmin() {
  const [customOrders, setCustomOrders] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("parikta_custom_orders")) || [];

    if (saved.length > 0) {
      setCustomOrders(saved);
    } else {
      setCustomOrders(dummyCustomOrders);
      localStorage.setItem(
        "parikta_custom_orders",
        JSON.stringify(dummyCustomOrders)
      );
    }
  }, []);

  const updateStatus = (id, status) => {
    const updated = customOrders.map((order) =>
      order.id === id ? { ...order, status } : order
    );

    setCustomOrders(updated);
    localStorage.setItem("parikta_custom_orders", JSON.stringify(updated));
  };

  const deleteCustomOrder = (id) => {
    const ok = window.confirm("Are you sure you want to delete this request?");
    if (!ok) return;

    const updated = customOrders.filter((order) => order.id !== id);
    setCustomOrders(updated);
    localStorage.setItem("parikta_custom_orders", JSON.stringify(updated));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Custom Orders
        </h1>

        <p className="text-[#8b746b] mt-2">
          Manage custom outfit design requests.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          ["Total Requests", customOrders.length],
          ["New", customOrders.filter((o) => o.status === "New").length],
          [
            "In Progress",
            customOrders.filter((o) => o.status === "In Progress").length,
          ],
          [
            "Completed",
            customOrders.filter((o) => o.status === "Completed").length,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5"
          >
            <h2 className="heading-font text-4xl text-[#9A3F4D]">{value}</h2>

            <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FDEAE6] text-[#5B3B32]">
            <tr>
              <th className="p-4">Request ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Dress</th>
              <th className="p-4">Fabric</th>
              <th className="p-4">Color</th>
              <th className="p-4">Budget</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {customOrders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-[#eadbd4] text-[#5B3B32]"
              >
                <td className="p-4 font-bold text-[#9A3F4D]">{order.id}</td>

                <td className="p-4">
                  <p className="font-semibold">{order.customer}</p>
                  <p className="text-xs text-[#8b746b]">{order.date}</p>
                </td>

                <td className="p-4">{order.phone}</td>
                <td className="p-4">{order.dressType}</td>
                <td className="p-4">{order.fabric}</td>
                <td className="p-4">{order.color}</td>
                <td className="p-4">{order.budget}</td>

                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-[#eadbd4] rounded-lg px-3 py-2 bg-white outline-none"
                  >
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Rejected</option>
                  </select>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => deleteCustomOrder(order.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5">
        {customOrders.map((order) => (
          <div
            key={order.id}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6"
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.22em] uppercase text-[#BFA996]">
                  {order.id}
                </p>

                <h3 className="heading-font text-3xl text-[#5B3B32] mt-2">
                  {order.dressType} Request
                </h3>

                <p className="text-[#8b746b] mt-1">
                  {order.customer} • {order.phone}
                </p>
              </div>

              <span className="bg-[#FDEAE6] text-[#9A3F4D] h-fit px-4 py-2 rounded-full text-sm font-bold">
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
              <div className="bg-[#f7f2ee] rounded-xl p-3">
                <p className="text-[#8b746b]">Fabric</p>
                <p className="font-semibold">{order.fabric}</p>
              </div>

              <div className="bg-[#f7f2ee] rounded-xl p-3">
                <p className="text-[#8b746b]">Color</p>
                <p className="font-semibold">{order.color}</p>
              </div>

              <div className="bg-[#f7f2ee] rounded-xl p-3">
                <p className="text-[#8b746b]">Budget</p>
                <p className="font-semibold">{order.budget}</p>
              </div>
            </div>

            <p className="text-[#6d554d] leading-7 mt-5 text-sm">
              {order.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomOrdersAdmin;