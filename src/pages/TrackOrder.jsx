import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { getOrderById } from "../services/orderService";

const steps = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function TrackOrder() {
  const { orderId: urlOrderId } = useParams();

  const [orderId, setOrderId] = useState(urlOrderId || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async (event, customOrderId) => {
    event?.preventDefault();

    const finalOrderId = String(customOrderId || orderId)
      .trim()
      .toUpperCase();

    if (!finalOrderId) {
      setError("Please enter your Order ID.");
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const response = await getOrderById(finalOrderId);

      if (!response?.success || !response?.order) {
        throw new Error(response?.message || "Order not found");
      }

      setOrder(response.order);
      setOrderId(finalOrderId);
    } catch (error) {
      console.error("Track order error:", error);

      setOrder(null);
      setError(
        error.message ||
          "Order could not be tracked. Please check the Order ID."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlOrderId) {
      trackOrder(null, urlOrderId);
    }
  }, [urlOrderId]);

  const currentIndex = order
    ? steps.indexOf(order.status)
    : -1;

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-10 md:py-14">
        <Container>
          <div className="max-w-3xl mx-auto text-center px-2">
            <p className="text-xs tracking-[0.3em] uppercase text-[#BFA996]">
              Track Your Order
            </p>

            <h1 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-3">
              Order Tracking
            </h1>

            <p className="text-[#8b746b] mt-3">
              Enter your Parikta Fashion order ID to check its
              latest status.
            </p>

            <form
              onSubmit={trackOrder}
              className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-4 md:p-6 mt-8 flex flex-col sm:flex-row gap-3"
            >
              <input
                value={orderId}
                onChange={(event) => {
                  setOrderId(event.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Enter Order ID e.g. PF123456"
                className="flex-1 border border-[#eadbd4] bg-white rounded-xl px-5 py-4 outline-none focus:border-[#9A3F4D]"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-[#9A3F4D] text-white px-7 py-4 rounded-xl font-bold disabled:opacity-60"
              >
                {loading ? "Checking..." : "Track Order"}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4">
                {error}
              </div>
            )}
          </div>

          {order && (
            <div className="max-w-4xl mx-auto mt-10 bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                <div>
                  <p className="text-[#8b746b] text-sm">
                    Order ID
                  </p>
                  <h3 className="font-bold text-[#9A3F4D] break-all">
                    {order.orderId}
                  </h3>
                </div>

                <div>
                  <p className="text-[#8b746b] text-sm">
                    Customer
                  </p>
                  <h3 className="font-bold text-[#5B3B32]">
                    {order.customer?.name || "Customer"}
                  </h3>
                </div>

                <div>
                  <p className="text-[#8b746b] text-sm">
                    Amount
                  </p>
                  <h3 className="font-bold text-[#5B3B32]">
                    ₹{formatAmount(order.amount)}
                  </h3>
                </div>

                <div>
                  <p className="text-[#8b746b] text-sm">
                    Status
                  </p>
                  <h3
                    className={`font-bold ${
                      order.status === "Cancelled"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {order.status}
                  </h3>
                </div>
              </div>

              {order.status === "Cancelled" ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-600 font-bold">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="min-w-[680px] flex items-start">
                    {steps.map((step, index) => {
                      const completed = index <= currentIndex;

                      return (
                        <div
                          key={step}
                          className="relative flex-1 text-center"
                        >
                          {index !== steps.length - 1 && (
                            <div
                              className={`absolute top-6 left-1/2 w-full h-1 ${
                                index < currentIndex
                                  ? "bg-[#9A3F4D]"
                                  : "bg-[#FDEAE6]"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                              completed
                                ? "bg-[#9A3F4D] text-white"
                                : "bg-[#FDEAE6] text-[#9A3F4D]"
                            }`}
                          >
                            {completed ? "✓" : index + 1}
                          </div>

                          <p
                            className={`mt-3 text-xs md:text-sm font-bold ${
                              completed
                                ? "text-[#5B3B32]"
                                : "text-[#8b746b]"
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5 mt-8 border-t border-[#eadbd4] pt-6">
                <div className="bg-[#f7f2ee] rounded-2xl p-5">
                  <p className="text-[#8b746b] text-sm">
                    Payment Method
                  </p>
                  <p className="font-bold text-[#5B3B32] mt-1">
                    {order.paymentMethod || "N/A"}
                  </p>
                </div>

                <div className="bg-[#f7f2ee] rounded-2xl p-5">
                  <p className="text-[#8b746b] text-sm">
                    Payment Status
                  </p>
                  <p className="font-bold text-[#5B3B32] mt-1">
                    {order.paymentStatus || "Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[#eadbd4] pt-6">
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-4">
                  Order Items
                </h2>

                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={item.productId || index}
                      className="flex gap-4 bg-[#f7f2ee] rounded-2xl p-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-xl bg-white"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-[#5B3B32]">
                          {item.name}
                        </h3>

                        <p className="text-[#8b746b] text-sm mt-1">
                          Size: {item.selectedSize || "Free Size"}
                        </p>

                        <p className="text-[#8b746b] text-sm">
                          Qty: {item.qty}
                        </p>

                        <p className="text-[#9A3F4D] font-bold mt-1">
                          ₹{formatAmount(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.address && (
                <div className="mt-8 border-t border-[#eadbd4] pt-6">
                  <h2 className="heading-font text-3xl text-[#5B3B32] mb-4">
                    Delivery Address
                  </h2>

                  <div className="bg-[#f7f2ee] rounded-2xl p-5 text-[#5B3B32]">
                    <p>{order.address.house}</p>
                    <p>
                      {order.address.city}, {order.address.state}
                    </p>
                    <p>{order.address.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default TrackOrder;