import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    email: "",
    house: "",
    city: "",
    state: "",
    pincode: "",
    payment: "COD",
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  );

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your bag is empty");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        customer: {
          name: address.name,
          phone: address.phone,
          email: address.email,
        },
        address: {
          house: address.house,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        items: cartItems.map((item) => ({
          productId: item._id || item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty || 1,
        })),
        amount: subtotal,
        paymentMethod: address.payment,
      };

      const response = await createOrder(orderData);

      if (response.success) {
        clearCart();
        navigate(`/order-success/${response.order.orderId}`);
      } else {
        alert(response.message || "Order failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server error. Order place nahi hua.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="text-center mb-10">
            <p className="text-[#BFA996] font-semibold tracking-[0.25em]">
              SECURE CHECKOUT
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              Checkout
            </h1>

            <p className="text-[#8b746b] mt-3">
              Complete your order with delivery details.
            </p>
          </div>

          <form
            onSubmit={placeOrder}
            className="grid lg:grid-cols-[65%_35%] gap-8"
          >
            <div className="bg-[#fffaf7] rounded-3xl p-8 shadow-sm border border-[#eadbd4]">
              <h2 className="heading-font text-3xl text-[#5B3B32] mb-6">
                Delivery Address
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                <input
                  name="name"
                  value={address.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />

                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />

                <input
                  name="email"
                  type="email"
                  value={address.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white md:col-span-2"
                />

                <input
                  name="house"
                  value={address.house}
                  onChange={handleChange}
                  placeholder="House No / Street / Area"
                  required
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white md:col-span-2"
                />

                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />

                <input
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />

                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  required
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />
              </div>

              <h2 className="heading-font text-3xl text-[#5B3B32] mt-10 mb-5">
                Payment Method
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {["COD", "UPI", "Card"].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() =>
                      setAddress({ ...address, payment: method })
                    }
                    className={`border rounded-2xl p-5 font-bold transition ${
                      address.payment === method
                        ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                        : "bg-white border-[#eadbd4] text-[#5B3B32] hover:border-[#9A3F4D]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <aside className="bg-[#fffaf7] rounded-3xl p-6 shadow-sm border border-[#eadbd4] h-fit lg:sticky lg:top-28">
              <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                Order Summary
              </h2>

              <div className="space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-[#8b746b]">Your bag is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="flex gap-4 border-b border-[#eadbd4] pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-xl bg-[#FDEAE6]"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-[#5B3B32]">
                          {item.name}
                        </h3>

                        <p className="text-[#8b746b] text-sm">
                          Qty: {item.qty || 1}
                        </p>

                        <p className="text-[#9A3F4D] font-bold">
                          ₹{item.price * (item.qty || 1)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 space-y-3 text-[#5B3B32]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>

                <div className="border-t border-[#eadbd4] pt-4 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold mt-6 hover:bg-[#7d3140] disabled:opacity-60"
              >
                {loading ? "PLACING ORDER..." : "PLACE ORDER"}
              </button>
            </aside>
          </form>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;