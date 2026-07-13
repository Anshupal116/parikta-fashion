import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyOrders,
  cancelOrder,
} from "../services/orderService";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await getMyOrders();

      if (response.success) {
        setOrders(response.orders || []);
      } else {
        alert(response.message || "Orders load nahi hue.");
      }
    } catch (error) {
      console.error("Orders load error:", error);

      if (error?.response?.status === 401) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      alert(
        error?.response?.data?.message ||
          "Server error. Orders load nahi hue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Kya aap is order ko cancel karna chahte hain?"
    );

    if (!confirmCancel) return;

    try {
      setCancellingId(orderId);

      const response = await cancelOrder(orderId);

      if (response.success) {
        alert("Order cancelled successfully.");

        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: "Cancelled",
                }
              : order
          )
        );
      } else {
        alert(response.message || "Order cancel nahi hua.");
      }
    } catch (error) {
      console.error("Cancel order error:", error);

      alert(
        error?.response?.data?.message ||
          "Server error. Order cancel nahi hua."
      );
    } finally {
      setCancellingId("");
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "out for delivery":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const canCancelOrder = (status) => {
    const currentStatus = status?.toLowerCase();

    return (
      currentStatus === "placed" ||
      currentStatus === "pending" ||
      currentStatus === "confirmed" ||
      currentStatus === "processing"
    );
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] bg-[#fffaf7] px-4 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

          <h2 className="mt-5 text-xl font-semibold text-[#5B3B32]">
            Loading your orders...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf7] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#9A3F4D]">
            Your purchases
          </p>

          <h1 className="heading-font text-3xl text-[#5B3B32] md:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8b746b] md:text-base">
            Apne orders, delivery status aur payment details yahan check
            karein.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#eadbd4] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ed] text-4xl">
              🛍️
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#5B3B32]">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8b746b]">
              Aapne abhi tak koi order place nahi kiya hai. Hamari latest
              collection explore karein.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-xl bg-[#9A3F4D] px-7 py-3.5 font-semibold text-white transition hover:bg-[#843743]"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderItems = order.items || order.orderItems || [];

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-[#f0e4df] bg-[#fff7f3] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:flex md:gap-10">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#9d8880]">
                          Order ID
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#5B3B32]">
                          #{order.orderNumber || order._id?.slice(-8)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#9d8880]">
                          Order Date
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#5B3B32]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#9d8880]">
                          Total Amount
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#9A3F4D]">
                          {formatPrice(
                            order.totalAmount ||
                              order.grandTotal ||
                              order.totalPrice
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
                        order.orderStatus || order.status
                      )}`}
                    >
                      {order.orderStatus || order.status || "Placed"}
                    </span>
                  </div>

                  <div className="divide-y divide-[#f1e7e2]">
                    {orderItems.map((item, index) => {
                      const product = item.product || item.productId || item;

                      return (
                        <div
                          key={item._id || `${order._id}-${index}`}
                          className="flex gap-4 px-5 py-5 md:gap-6 md:px-7"
                        >
                          <img
                            src={
                              item.image ||
                              product?.image ||
                              "/images/product-placeholder.jpg"
                            }
                            alt={
                              item.name ||
                              product?.name ||
                              "Ordered product"
                            }
                            className="h-28 w-24 flex-shrink-0 rounded-2xl border border-[#eadbd4] object-cover md:h-36 md:w-28"
                            onError={(event) => {
                              event.currentTarget.src =
                                "/images/product-placeholder.jpg";
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-base font-bold text-[#5B3B32] md:text-lg">
                              {item.name ||
                                product?.name ||
                                "Product"}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#8b746b]">
                              {item.size && (
                                <span>
                                  Size:{" "}
                                  <strong className="text-[#5B3B32]">
                                    {item.size}
                                  </strong>
                                </span>
                              )}

                              {item.color && (
                                <span>
                                  Color:{" "}
                                  <strong className="text-[#5B3B32]">
                                    {item.color}
                                  </strong>
                                </span>
                              )}

                              <span>
                                Qty:{" "}
                                <strong className="text-[#5B3B32]">
                                  {item.quantity || 1}
                                </strong>
                              </span>
                            </div>

                            <p className="mt-4 text-base font-bold text-[#9A3F4D]">
                              {formatPrice(
                                item.price || product?.price
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-4 border-t border-[#eadbd4] bg-[#fffdfb] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                    <div className="text-sm text-[#8b746b]">
                      <p>
                        Payment:{" "}
                        <span className="font-bold text-[#5B3B32]">
                          {order.paymentMethod || "Cash on Delivery"}
                        </span>
                      </p>

                      <p className="mt-1">
                        Payment Status:{" "}
                        <span
                          className={`font-bold ${
                            order.paymentStatus
                              ?.toLowerCase() === "paid"
                              ? "text-green-700"
                              : "text-orange-700"
                          }`}
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        to={`/order-details/${order._id}`}
                        className="rounded-xl border border-[#9A3F4D] px-6 py-3 text-center text-sm font-bold text-[#9A3F4D] transition hover:bg-[#fff2ee]"
                      >
                        VIEW DETAILS
                      </Link>

                      {canCancelOrder(
                        order.orderStatus || order.status
                      ) && (
                        <button
                          type="button"
                          disabled={cancellingId === order._id}
                          onClick={() =>
                            handleCancelOrder(order._id)
                          }
                          className="rounded-xl bg-[#5B3B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#432b25] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {cancellingId === order._id
                            ? "CANCELLING..."
                            : "CANCEL ORDER"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;