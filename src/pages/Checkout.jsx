import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import CouponBox from "../components/CouponBox";

import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";
import { useCustomer } from "../context/CustomerContext";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    discountAmount,
    finalTotal,
    appliedCoupon,
    clearCart,
  } = useCart();

  const { token, isLoggedIn } = useCustomer();

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

  const handleChange = (event) => {
    setAddress((currentAddress) => ({
      ...currentAddress,
      [event.target.name]: event.target.value,
    }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!isLoggedIn || !token) {
      alert("Order place karne ke liye login karo");

      navigate("/login", {
        state: {
          from: "/checkout",
        },
      });

      return;
    }

    if (cartItems.length === 0) {
      alert("Your bag is empty");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        customer: {
          name: address.name.trim(),
          phone: address.phone.trim(),
          email: address.email.trim(),
        },

        address: {
          house: address.house.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },

        items: cartItems.map((item) => ({
          productId: item._id || item.id,
          name: item.name,
          image: item.image,
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          selectedSize: item.selectedSize || "Free Size",
        })),

        subtotal: Number(cartTotal || 0),
        discountAmount: Number(discountAmount || 0),
        amount: Number(finalTotal || 0),

        couponCode:
          appliedCoupon?.coupon?.code || "",

        couponId:
          appliedCoupon?.coupon?._id || null,

        paymentMethod: address.payment,
      };

      const response = await createOrder(
        orderData,
        token
      );

      if (response.success) {
        clearCart();

        navigate(
          `/order-success/${response.order.orderId}`
        );
      } else {
        alert(response.message || "Order failed");
      }
    } catch (error) {
      console.error("Order place error:", error);

      alert(
        error.response?.data?.message ||
          "Server error. Order place nahi hua."
      );
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
                  type="tel"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
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
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />
              </div>

              <h2 className="heading-font text-3xl text-[#5B3B32] mt-10 mb-5">
                Payment Method
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {["COD", "UPI", "Card"].map(
                  (method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() =>
                        setAddress(
                          (currentAddress) => ({
                            ...currentAddress,
                            payment: method,
                          })
                        )
                      }
                      className={`border rounded-2xl p-5 font-bold transition ${
                        address.payment === method
                          ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                          : "bg-white border-[#eadbd4] text-[#5B3B32] hover:border-[#9A3F4D]"
                      }`}
                    >
                      {method}
                    </button>
                  )
                )}
              </div>

              {address.payment !== "COD" && (
                <div className="mt-5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-4 text-sm leading-6">
                  Online payment gateway abhi connect nahi
                  hai. Filhaal testing ke liye order
                  payment status Pending rahega.
                </div>
              )}
            </div>

            <aside className="bg-[#fffaf7] rounded-3xl p-6 shadow-sm border border-[#eadbd4] h-fit lg:sticky lg:top-28">
              <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                Order Summary
              </h2>

              <div className="mb-5">
                <CouponBox />
              </div>

              <div className="space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-[#8b746b]">
                    Your bag is empty.
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={
                        item.cartItemId ||
                        `${item._id || item.id}-${
                          item.selectedSize ||
                          "Free Size"
                        }`
                      }
                      className="flex gap-4 border-b border-[#eadbd4] pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover object-top rounded-xl bg-[#FDEAE6]"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-[#5B3B32]">
                          {item.name}
                        </h3>

                        <p className="text-[#8b746b] text-sm mt-1">
                          Size:{" "}
                          {item.selectedSize ||
                            "Free Size"}
                        </p>

                        <p className="text-[#8b746b] text-sm">
                          Qty: {item.qty || 1}
                        </p>

                        <p className="text-[#9A3F4D] font-bold mt-1">
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.qty || 1)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 space-y-3 text-[#5B3B32]">
                <div className="flex justify-between">
                  <span>Subtotal</span>

                  <span>
                    ₹
                    {Number(
                      cartTotal || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>
                      Coupon (
                      {appliedCoupon?.coupon?.code})
                    </span>

                    <span className="font-bold">
                      -₹
                      {Number(
                        discountAmount
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery</span>

                  <span className="text-green-600 font-bold">
                    Free
                  </span>
                </div>

                <div className="border-t border-[#eadbd4] pt-4 flex justify-between text-xl font-bold">
                  <span>Total</span>

                  <span>
                    ₹
                    {Number(
                      finalTotal || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {appliedCoupon && (
                <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-green-800">
                    Coupon{" "}
                    {appliedCoupon.coupon?.code} applied
                  </p>

                  <p className="text-xs text-green-700 mt-1">
                    You are saving ₹
                    {Number(
                      discountAmount || 0
                    ).toLocaleString("en-IN")}{" "}
                    on this order.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  cartItems.length === 0
                }
                className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold mt-6 hover:bg-[#7d3140] disabled:opacity-60"
              >
                {loading
                  ? "PLACING ORDER..."
                  : `PLACE ORDER • ₹${Number(
                      finalTotal || 0
                    ).toLocaleString("en-IN")}`}
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