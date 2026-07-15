import { useEffect, useState } from "react";
import {
  FiDownload,
  FiEye,
  FiMapPin,
  FiPrinter,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/orderService";

import { generateInvoicePDF } from "../../utils/invoiceGenerator";

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

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

      alert(
        error.response?.data?.message ||
          "Orders load failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    id,
    currentStatus,
    newStatus
  ) => {
    if (currentStatus === newStatus) return;

    if (
      ["Cancelled", "Delivered"].includes(
        currentStatus
      )
    ) {
      alert(
        `${currentStatus} order ka status change nahi ho sakta`
      );
      return;
    }

    const ok = window.confirm(
      `Order status ${currentStatus} se ${newStatus} karna hai?`
    );

    if (!ok) return;

    try {
      setUpdatingId(id);

      const response = await updateOrderStatus(
        id,
        newStatus
      );

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

        if (selectedOrder?._id === id) {
          setSelectedOrder((current) => ({
            ...current,
            status: newStatus,
          }));
        }

        alert("Order status updated successfully");
      } else {
        alert(
          response.message ||
            "Status update failed"
        );

        loadOrders();
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Order status update failed"
      );

      loadOrders();
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (
    id,
    orderId
  ) => {
    const ok = window.confirm(
      `Are you sure you want to permanently delete order ${orderId}?`
    );

    if (!ok) return;

    try {
      setDeletingId(id);

      const response = await deleteOrder(id);

      if (response.success) {
        setOrders((currentOrders) =>
          currentOrders.filter(
            (order) => order._id !== id
          )
        );

        if (selectedOrder?._id === id) {
          setSelectedOrder(null);
        }

        alert("Order deleted successfully");
      } else {
        alert(
          response.message ||
            "Order delete failed"
        );
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

  const totalRevenue = orders.reduce(
    (sum, order) => {
      if (order.status === "Cancelled") {
        return sum;
      }

      return sum + Number(order.amount || 0);
    },
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const printOrder = () => {
    window.print();
  };

  const downloadInvoice = () => {
    if (!selectedOrder) return;

    try {
      generateInvoicePDF(selectedOrder);
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Invoice download failed");
    }
  };

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
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          ["Total Orders", orders.length],
          ["Pending", pendingOrders],
          ["Delivered", deliveredOrders],
          ["Cancelled", cancelledOrders],
          [
            "Revenue",
            `₹${totalRevenue.toLocaleString(
              "en-IN"
            )}`,
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
          <table className="w-full min-w-[1280px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4 whitespace-nowrap">
                  Order ID
                </th>
                <th className="p-4 whitespace-nowrap">
                  Customer
                </th>
                <th className="p-4 whitespace-nowrap">
                  Phone
                </th>
                <th className="p-4">Items</th>
                <th className="p-4 whitespace-nowrap">
                  Amount
                </th>
                <th className="p-4 whitespace-nowrap">
                  Payment
                </th>
                <th className="p-4 whitespace-nowrap">
                  Date
                </th>
                <th className="p-4 whitespace-nowrap">
                  Status
                </th>
                <th className="p-4 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const isFinalStatus = [
                  "Cancelled",
                  "Delivered",
                ].includes(order.status);

                const isUpdating =
                  updatingId === order._id;

                const isDeleting =
                  deletingId === order._id;

                return (
                  <tr
                    key={order._id}
                    className="border-t border-[#eadbd4] text-[#5B3B32] hover:bg-[#fff7f3] transition"
                  >
                    <td className="p-4 font-bold text-[#9A3F4D] whitespace-nowrap">
                      {order.orderId || "-"}
                    </td>

                    <td className="p-4 font-semibold whitespace-nowrap">
                      {order.customer?.name ||
                        "Guest Customer"}
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
                                  `${item.name} × ${
                                    item.qty || 1
                                  }`
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
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
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
                              order.status ===
                              "Cancelled"
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          className="bg-[#5B3B32] hover:bg-[#3e2f29] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2"
                        >
                          <FiEye />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              order._id,
                              order.orderId
                            )
                          }
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
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

      {selectedOrder && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:bg-white">
          <div className="w-full max-w-5xl max-h-[94vh] overflow-y-auto bg-[#fffaf7] rounded-3xl shadow-2xl print:max-w-none print:max-h-none print:shadow-none print:rounded-none">
            <header className="px-6 md:px-8 py-6 border-b border-[#eadbd4] flex items-start justify-between gap-4 print:border-b-2">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                  Order Details
                </p>

                <h2 className="heading-font text-4xl text-[#5B3B32] mt-1">
                  {selectedOrder.orderId}
                </h2>

                <p className="text-sm text-[#8b746b] mt-2">
                  {selectedOrder.createdAt
                    ? new Date(
                        selectedOrder.createdAt
                      ).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <button
                  type="button"
                  onClick={downloadInvoice}
                  className="bg-[#9A3F4D] text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <FiDownload />
                  Download Invoice
                </button>

                <button
                  type="button"
                  onClick={printOrder}
                  className="border border-[#9A3F4D] text-[#9A3F4D] px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <FiPrinter />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                  className="w-11 h-11 rounded-full border border-[#eadbd4] text-[#5B3B32] flex items-center justify-center"
                >
                  <FiX size={21} />
                </button>
              </div>
            </header>

            <div className="p-6 md:p-8 space-y-7">
              <div className="grid md:grid-cols-2 gap-5">
                <section className="bg-white border border-[#eadbd4] rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-[#9A3F4D]" />
                    <h3 className="font-bold text-[#5B3B32]">
                      Customer Information
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#6d554d]">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedOrder.customer?.name ||
                        "-"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {selectedOrder.customer?.phone ||
                        "-"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedOrder.customer?.email ||
                        "-"}
                    </p>
                  </div>
                </section>

                <section className="bg-white border border-[#eadbd4] rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-[#9A3F4D]" />
                    <h3 className="font-bold text-[#5B3B32]">
                      Shipping Address
                    </h3>
                  </div>

                  <p className="mt-4 text-sm text-[#6d554d] leading-6">
                    {[
                      selectedOrder.address?.house,
                      selectedOrder.address?.city,
                      selectedOrder.address?.state,
                      selectedOrder.address?.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </section>
              </div>

              <section className="bg-white border border-[#eadbd4] rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="text-[#9A3F4D]" />
                  <h3 className="font-bold text-[#5B3B32]">
                    Ordered Items
                  </h3>
                </div>

                <div className="mt-5 space-y-4">
                  {selectedOrder.items?.map(
                    (item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="grid grid-cols-[80px_1fr_auto] gap-4 items-center border-b border-[#eadbd4] pb-4 last:border-b-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-24 object-cover object-top rounded-xl bg-[#FDEAE6]"
                        />

                        <div>
                          <h4 className="font-bold text-[#5B3B32]">
                            {item.name}
                          </h4>

                          <p className="text-sm text-[#8b746b] mt-1">
                            Size:{" "}
                            {item.selectedSize ||
                              "Free Size"}
                          </p>

                          <p className="text-sm text-[#8b746b]">
                            Qty: {item.qty || 1} × ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <p className="font-bold text-[#9A3F4D] whitespace-nowrap">
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.qty || 1)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-5">
                <section className="bg-white border border-[#eadbd4] rounded-2xl p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Payment & Status
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-[#6d554d]">
                    <div className="flex justify-between">
                      <span>Payment Method</span>
                      <strong>
                        {selectedOrder.paymentMethod ||
                          "-"}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Payment Status</span>
                      <strong>
                        {selectedOrder.paymentStatus ||
                          "Pending"}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Order Status</span>
                      <span
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="bg-white border border-[#eadbd4] rounded-2xl p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Price Breakdown
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-[#6d554d]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <strong>
                        ₹
                        {Number(
                          selectedOrder.subtotal ??
                            selectedOrder.amount ??
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between text-green-700">
                      <span>
                        Coupon{" "}
                        {selectedOrder.couponCode
                          ? `(${selectedOrder.couponCode})`
                          : ""}
                      </span>
                      <strong>
                        -₹
                        {Number(
                          selectedOrder.discountAmount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <strong className="text-green-700">
                        Free
                      </strong>
                    </div>

                    <div className="border-t border-[#eadbd4] pt-3 flex justify-between text-lg text-[#5B3B32]">
                      <span>Grand Total</span>
                      <strong>
                        ₹
                        {Number(
                          selectedOrder.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersAdmin;