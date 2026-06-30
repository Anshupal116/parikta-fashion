import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { getOrderById } from "../services/orderService";

function OrderSuccess() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await getOrderById(orderId);

        if (response.success) {
          setOrder(response.order);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14 flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto bg-[#fffaf7] border border-[#eadbd4] rounded-[32px] shadow-lg p-8 md:p-10 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#FDEAE6] flex items-center justify-center text-5xl text-[#9A3F4D]">
              ✓
            </div>

            <p className="text-[#BFA996] font-semibold tracking-[0.25em] mt-8">
              ORDER CONFIRMED
            </p>

            <h1 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-3">
              Thank You For Your Order
            </h1>

            <p className="text-[#8b746b] mt-4 leading-7">
              Your order has been received and will be processed soon.
            </p>

            <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-5 mt-8">
              <p className="text-[#8b746b]">Order ID</p>
              <h2 className="text-2xl font-bold text-[#9A3F4D] mt-2">
                {orderId}
              </h2>
            </div>

            {loading ? (
              <p className="text-[#8b746b] mt-5">Loading order details...</p>
            ) : order ? (
              <div className="text-left bg-[#f7f2ee] border border-[#eadbd4] rounded-2xl p-5 mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#8b746b]">Customer</span>
                  <span className="font-semibold text-[#5B3B32]">
                    {order.customer?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#8b746b]">Amount</span>
                  <span className="font-bold text-[#9A3F4D]">
                    ₹{order.amount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#8b746b]">Payment</span>
                  <span className="font-semibold text-[#5B3B32]">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#8b746b]">Status</span>
                  <span className="font-semibold text-green-600">
                    {order.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-red-500 mt-5">
                Order details not found.
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <Link to="/products">
                <button className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold hover:bg-[#7d3140]">
                  Continue Shopping
                </button>
              </Link>

              <Link to={`/track-order/${orderId}`}>
                <button className="w-full border-2 border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold hover:bg-[#FDEAE6]">
                  Track Order
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default OrderSuccess;