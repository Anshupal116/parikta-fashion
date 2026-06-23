import { useEffect, useState } from "react";

const dummyOrders = [
  {
    id: "PF1001",
    customer: "Ananya Sharma",
    phone: "9876543210",
    items: "Designer Pink Suit",
    amount: 2499,
    status: "Pending",
    date: "23 Jun 2026",
  },
  {
    id: "PF1002",
    customer: "Megha Verma",
    phone: "9876500000",
    items: "Bridal Lehenga",
    amount: 12999,
    status: "Confirmed",
    date: "22 Jun 2026",
  },
  {
    id: "PF1003",
    customer: "Ritika Jain",
    phone: "9876512345",
    items: "Party Wear Saree",
    amount: 3499,
    status: "Shipped",
    date: "21 Jun 2026",
  },
];

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("parikta_orders"));

    if (savedOrders && savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      setOrders(dummyOrders);
      localStorage.setItem("parikta_orders", JSON.stringify(dummyOrders));
    }
  }, []);

  const updateStatus = (id, status) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status } : order
    );

    setOrders(updatedOrders);
    localStorage.setItem("parikta_orders", JSON.stringify(updatedOrders));
  };

  const deleteOrder = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    const updatedOrders = orders.filter((order) => order.id !== id);
    setOrders(updatedOrders);
    localStorage.setItem("parikta_orders", JSON.stringify(updatedOrders));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Orders
        </h1>
        <p className="text-[#8b746b] mt-2">
          Manage customer orders and delivery status.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          ["Total Orders", orders.length],
          ["Pending", orders.filter((o) => o.status === "Pending").length],
          ["Shipped", orders.filter((o) => o.status === "Shipped").length],
          ["Delivered", orders.filter((o) => o.status === "Delivered").length],
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
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Items</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-[#eadbd4] text-[#5B3B32]"
              >
                <td className="p-4 font-bold text-[#9A3F4D]">
                  {order.id}
                </td>

                <td className="p-4 font-semibold">
                  {order.customer}
                </td>

                <td className="p-4">
                  {order.phone}
                </td>

                <td className="p-4">
                  {order.items}
                </td>

                <td className="p-4 font-bold">
                  ₹{order.amount}
                </td>

                <td className="p-4">
                  {order.date}
                </td>

                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-[#eadbd4] rounded-lg px-3 py-2 bg-white outline-none"
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => deleteOrder(order.id)}
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
    </div>
  );
}

export default OrdersAdmin;