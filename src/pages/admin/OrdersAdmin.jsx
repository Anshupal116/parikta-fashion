import { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/orderService";

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();

      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.log(error);
      alert("Orders load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await updateOrderStatus(id, status);

      if (response.success) {
        loadOrders();
      } else {
        alert(response.message || "Status update failed");
      }
    } catch (error) {
      console.log(error);
      alert("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this order?");
    if (!ok) return;

    try {
      const response = await deleteOrder(id);

      if (response.success) {
        alert("Order deleted successfully");
        loadOrders();
      }
    } catch (error) {
      console.log(error);
      alert("Order delete failed");
    }
  };

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "Cancelled") return sum;
    return sum + Number(order.amount || 0);
  }, 0);

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#5B3B32]">
          Loading Orders...
        </h2>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">Orders</h1>
        <p className="text-[#8b746b] mt-2">
          Manage customer orders from MongoDB.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          ["Total Orders", orders.length],
          ["Pending", orders.filter((o) => o.status === "Pending").length],
          ["Delivered", orders.filter((o) => o.status === "Delivered").length],
          ["Revenue", `₹${totalRevenue}`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5"
          >
            <h2 className="heading-font text-4xl text-[#9A3F4D]">
              {value}
            </h2>
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
              <th className="p-4">Payment</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-t border-[#eadbd4] text-[#5B3B32]"
              >
                <td className="p-4 font-bold text-[#9A3F4D]">
                  {order.orderId}
                </td>

                <td className="p-4 font-semibold">
                  {order.customer?.name}
                </td>

                <td className="p-4">{order.customer?.phone}</td>

                <td className="p-4">
                  {order.items?.map((item) => item.name).join(", ")}
                </td>

                <td className="p-4 font-bold">₹{order.amount}</td>

                <td className="p-4">{order.paymentMethod}</td>

                <td className="p-4">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </td>

                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
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
                    onClick={() => handleDelete(order._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-[#5B3B32]">
              No Orders Found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersAdmin;