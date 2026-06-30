import { useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { getOrderById } from "../services/orderService";

const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];

function TrackOrder() {
  const { orderId: urlOrderId } = useParams();

  const [orderId, setOrderId] = useState(urlOrderId || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async (e) => {
    e?.preventDefault();

    if (!orderId.trim()) {
      alert("Order ID enter karo");
      return;
    }

    try {
      setLoading(true);
      const response = await getOrderById(orderId.trim());

      if (response.success) {
        setOrder(response.order);
      } else {
        setOrder(null);
        alert("Order not found");
      }
    } catch (error) {
      console.log(error);
      alert("Order track nahi hua");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? steps.indexOf(order.status) : -1;

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-[#BFA996]">
              Track Your Order
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              Order Tracking
            </h1>

            <form
              onSubmit={trackOrder}
              className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 mt-8 flex gap-3"
            >
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID e.g. PF123456"
                className="flex-1 border border-[#eadbd4] rounded-xl px-5 py-4 outline-none"
              />

              <button
                disabled={loading}
                className="bg-[#9A3F4D] text-white px-7 rounded-xl font-bold disabled:opacity-60"
              >
                {loading ? "Checking..." : "Track"}
              </button>
            </form>
          </div>

          {order && (
            <div className="max-w-4xl mx-auto mt-10 bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8">
              <div className="grid md:grid-cols-4 gap-5 mb-8">
                <div>
                  <p className="text-[#8b746b] text-sm">Order ID</p>
                  <h3 className="font-bold text-[#9A3F4D]">{order.orderId}</h3>
                </div>

                <div>
                  <p className="text-[#8b746b] text-sm">Customer</p>
                  <h3 className="font-bold text-[#5B3B32]">
                    {order.customer?.name}
                  </h3>
                </div>

                <div>
                  <p className="text-[#8b746b] text-sm">Amount</p>
                  <h3 className="font-bold text-[#5B3B32]">₹{order.amount}</h3>
                </div>

                <div>
                  <p className="text-[#8b746b] text-sm">Status</p>
                  <h3 className="font-bold text-green-600">{order.status}</h3>
                </div>
              </div>

              {order.status === "Cancelled" ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-600 font-bold">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {steps.map((step, index) => (
                    <div key={step} className="text-center">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                          index <= currentIndex
                            ? "bg-[#9A3F4D] text-white"
                            : "bg-[#FDEAE6] text-[#9A3F4D]"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <p
                        className={`mt-3 text-xs md:text-sm font-bold ${
                          index <= currentIndex
                            ? "text-[#5B3B32]"
                            : "text-[#8b746b]"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-[#eadbd4] pt-6">
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-4">
                  Order Items
                </h2>

                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 bg-[#f7f2ee] rounded-2xl p-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-xl"
                      />

                      <div>
                        <h3 className="font-bold text-[#5B3B32]">
                          {item.name}
                        </h3>
                        <p className="text-[#8b746b] text-sm">
                          Qty: {item.qty}
                        </p>
                        <p className="text-[#9A3F4D] font-bold">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default TrackOrder;