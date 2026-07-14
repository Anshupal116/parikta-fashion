import { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/orderService";

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await getOrders();

      if (response.success) {
        setOrders(response.orders || []);
      } else {
        alert(response.message || "Orders load failed");
      }
    } catch (error) {
      console.error("Orders load error:", error);
      alert(error.response?.data?.message || "Orders load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;

    if (["Cancelled", "Delivered"].includes(currentStatus)) {
      alert(`${currentStatus} order ka status change nahi ho sakta`);
      return;
    }

    const ok = window.confirm(
      `Order status ${currentStatus} se ${newStatus} karna hai?`
    );

    if (!ok) return;

    try {
      setUpdatingId(id);

      const response = await updateOrderStatus(id, newStatus);

      if (response.success) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === id
              ? {
                  ...order,
                  status: newStatus,
                }
              : order
          )
        );

        alert("Order status updated successfully");
      } else {
        alert(response.message || "Status update failed");
        loadOrders();
      }
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error.response?.data?.message ||
          "Order status update failed"
      );

      loadOrders();
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (id, orderId) => {
    const ok = window.confirm(
      `Are you sure you want to permanently delete order ${orderId}?`
    );

    if (!ok) return;

    try {
      setDeletingId(id);

      const response = await deleteOrder(id);

      if (response.success) {
        setOrders((currentOrders) =>
          currentOrders.filter((order) => order._id !== id)
        );

        alert("Order deleted successfully");
      } else {
        alert(response.message || "Order delete failed");
      }
    } catch (error) {
      console.error("Order delete error:", error);

      alert(
        error.response?.data?.message ||
          "Order delete failed"
      );
    } finally {
      setDeletingId("");
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      Pending:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
      Confirmed:
        "bg-blue-100 text-blue-700 border-blue-200",
      Shipped:
        "bg-purple-100 text-purple-700 border-purple-200",
      Delivered:
        "bg-green-100 text-green-700 border-green-200",
      Cancelled:
        "bg-red-100 text-red-700 border-red-200",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "Cancelled") return sum;

    return sum + Number(order.amount || 0);
  }, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

          <h2 className="text-2xl font-bold text-[#5B3B32] mt-5">
            Loading Orders...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Orders
        </h1>

        <p className="text-[#8b746b] mt-2">
          Manage, track and update customer orders.
        </p>
        <button
            onClick={loadCustomers}
            className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold"
          >
            Refresh
          </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          ["Total Orders", orders.length],
          ["Pending", pendingOrders],
          ["Delivered", deliveredOrders],
          ["Cancelled", cancelledOrders],
          [
            "Revenue",
            `₹${totalRevenue.toLocaleString("en-IN")}`,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm"
          >
            <h2 className="heading-font text-3xl md:text-4xl text-[#9A3F4D]">
              {value}
            </h2>

            <p className="text-[11px] tracking-[0.16em] uppercase text-[#5B3B32] mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4 whitespace-nowrap">Order ID</th>
                <th className="p-4 whitespace-nowrap">Customer</th>
                <th className="p-4 whitespace-nowrap">Phone</th>
                <th className="p-4">Items</th>
                <th className="p-4 whitespace-nowrap">Amount</th>
                <th className="p-4 whitespace-nowrap">Payment</th>
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const isFinalStatus = [
                  "Cancelled",
                  "Delivered",
                ].includes(order.status);

                const isUpdating = updatingId === order._id;
                const isDeleting = deletingId === order._id;

                return (
                  <tr
                    key={order._id}
                    className="border-t border-[#eadbd4] text-[#5B3B32] hover:bg-[#fff7f3] transition"
                  >
                    <td className="p-4 font-bold text-[#9A3F4D] whitespace-nowrap">
                      {order.orderId || "-"}
                    </td>

                    <td className="p-4 font-semibold whitespace-nowrap">
                      {order.customer?.name || "Guest Customer"}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {order.customer?.phone || "-"}
                    </td>

                    <td className="p-4 max-w-[280px]">
                      <div className="line-clamp-2">
                        {order.items?.length
                          ? order.items
                              .map(
                                (item) =>
                                  `${item.name} × ${item.qty || 1}`
                              )
                              .join(", ")
                          : "No items"}
                      </div>
                    </td>

                    <td className="p-4 font-bold whitespace-nowrap">
                      ₹
                      {Number(
                        order.amount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {order.paymentMethod || "-"}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="p-4 min-w-[180px]">
                      {isFinalStatus ? (
                        <div>
                          <span
                            className={`inline-flex px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.08em] ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>

                          <p
                            className={`text-[11px] mt-2 ${
                              order.status === "Cancelled"
                                ? "text-red-600"
                                : "text-green-700"
                            }`}
                          >
                            Final status — locked
                          </p>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(event) =>
                            handleStatusChange(
                              order._id,
                              order.status,
                              event.target.value
                            )
                          }
                          className="w-full border border-[#eadbd4] rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[#9A3F4D] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Confirmed">
                            Confirmed
                          </option>

                          <option value="Shipped">
                            Shipped
                          </option>

                          <option value="Delivered">
                            Delivered
                          </option>
                        </select>
                      )}

                      {isUpdating && (
                        <p className="text-xs text-[#9A3F4D] mt-2">
                          Updating status...
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          handleDelete(
                            order._id,
                            order.orderId
                          )
                        }
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-[#5B3B32]">
              No Orders Found
            </h3>

            <p className="text-[#8b746b] mt-2">
              New customer orders will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersAdmin;