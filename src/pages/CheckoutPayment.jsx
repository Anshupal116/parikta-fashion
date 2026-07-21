import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiLock, FiTruck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import CouponBox from "../components/CouponBox";
import CheckoutStepper from "../components/CheckoutStepper";

import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import {
  createOrder,
  createRazorpayOrder,
  markRazorpayPaymentFailed,
  verifyRazorpayPayment,
} from "../services/orderService";

const SELECTED_ADDRESS_KEY = "pariktaCheckoutAddress";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function CheckoutPayment() {
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

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedAddress = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(SELECTED_ADDRESS_KEY) || "null"
      );
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }

    if (!selectedAddress) {
      navigate("/checkout/address", { replace: true });
    }
  }, [cartItems.length, navigate, selectedAddress]);

  const handleOnlinePayment = async (appOrder) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Razorpay payment window load nahi hui. Internet connection check karo."
      );
    }

    const razorpayResponse = await createRazorpayOrder(appOrder._id, token);

    if (!razorpayResponse.success) {
      throw new Error(
        razorpayResponse.message || "Razorpay order create failed"
      );
    }

    const options = {
      key:
        razorpayResponse.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayResponse.razorpayOrder.amount,
      currency: razorpayResponse.razorpayOrder.currency,
      name: "Parikta Fashion",
      description: `Payment for order ${appOrder.orderId}`,
      order_id: razorpayResponse.razorpayOrder.id,
      prefill: {
        name: selectedAddress.name,
        email: selectedAddress.email || "",
        contact: selectedAddress.phone,
      },
      notes: {
        appOrderId: appOrder.orderId,
      },
      theme: {
        color: "#9A3F4D",
      },
      modal: {
        confirm_close: true,
        ondismiss: async () => {
          setLoading(false);

          try {
            await markRazorpayPaymentFailed(
              {
                orderId: appOrder._id,
                reason: "Payment popup closed by customer",
              },
              token
            );
          } catch (paymentError) {
            console.error("Payment dismissal update failed:", paymentError);
          }
        },
      },
      handler: async (paymentResponse) => {
        try {
          setLoading(true);

          const verificationResponse = await verifyRazorpayPayment(
            {
              orderId: appOrder._id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            },
            token
          );

          if (!verificationResponse.success) {
            throw new Error(
              verificationResponse.message || "Payment verification failed"
            );
          }

          clearCart();
          sessionStorage.removeItem(SELECTED_ADDRESS_KEY);
          navigate(`/order-success/${appOrder.orderId}`);
        } catch (verificationError) {
          setError(
            verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment verify nahi hui."
          );
        } finally {
          setLoading(false);
        }
      },
    };

    const razorpayCheckout = new window.Razorpay(options);

    razorpayCheckout.on("payment.failed", async (response) => {
      const failureReason =
        response.error?.description ||
        response.error?.reason ||
        "Payment failed";

      try {
        await markRazorpayPaymentFailed(
          {
            orderId: appOrder._id,
            reason: failureReason,
          },
          token
        );
      } catch (paymentError) {
        console.error("Payment failure update error:", paymentError);
      }

      setLoading(false);
      setError(`Payment failed: ${failureReason}`);
    });

    setLoading(false);
    razorpayCheckout.open();
  };

  const placeOrder = async () => {
    if (!isLoggedIn || !token) {
      navigate("/login", {
        state: { from: "/checkout/payment" },
      });
      return;
    }

    if (!selectedAddress) {
      navigate("/checkout/address");
      return;
    }

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const orderData = {
        customer: {
          name: selectedAddress.name.trim(),
          phone: selectedAddress.phone.trim(),
          email: (selectedAddress.email || "").trim(),
        },

        address: {
          house: `${selectedAddress.house}, ${selectedAddress.area}${
            selectedAddress.landmark
              ? `, ${selectedAddress.landmark}`
              : ""
          }`,
          city: selectedAddress.city.trim(),
          state: selectedAddress.state.trim(),
          pincode: selectedAddress.pincode.trim(),
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

        couponCode: appliedCoupon?.coupon?.code || "",
        couponId: appliedCoupon?.coupon?._id || null,
        paymentMethod,
      };

      const response = await createOrder(orderData, token);

      if (!response.success) {
        throw new Error(response.message || "Order failed");
      }

      const appOrder = response.order;

      if (paymentMethod === "COD") {
        clearCart();
        sessionStorage.removeItem(SELECTED_ADDRESS_KEY);
        navigate(`/order-success/${appOrder.orderId}`);
        return;
      }

      await handleOnlinePayment(appOrder);
    } catch (orderError) {
      console.error("Order place error:", orderError);
      setError(
        orderError.response?.data?.message ||
          orderError.message ||
          "Server error. Order place nahi hua."
      );
      setLoading(false);
    }
  };

  if (!selectedAddress) return null;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee] pb-28 pt-6 md:pb-14 md:pt-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/checkout/address")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4] bg-white text-[#5B3B32]"
              >
                <FiArrowLeft size={21} />
              </button>

              <div className="text-center">
                <h1 className="heading-font text-3xl text-[#5B3B32] md:text-4xl">
                  Payment
                </h1>
                <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                  STEP 3 OF 3
                </p>
              </div>

              <div className="h-11 w-11" />
            </div>

            <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-5">
              <CheckoutStepper activeStep="payment" />
            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[1fr_380px]">
              <section className="space-y-5">
                <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                        DELIVER TO
                      </p>
                      <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                        {selectedAddress.name}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/checkout/address")}
                      className="font-bold text-[#9A3F4D]"
                    >
                      Change
                    </button>
                  </div>

                  <p className="mt-4 leading-6 text-[#75635c]">
                    {selectedAddress.house}, {selectedAddress.area}
                    {selectedAddress.landmark
                      ? `, ${selectedAddress.landmark}`
                      : ""}
                    <br />
                    {selectedAddress.city}, {selectedAddress.state} -{" "}
                    {selectedAddress.pincode}
                  </p>

                  <p className="mt-2 font-semibold text-[#5B3B32]">
                    Mobile: {selectedAddress.phone}
                  </p>
                </div>

                <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-7">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                    PAYMENT METHOD
                  </p>
                  <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                    Choose payment option
                  </h2>

                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "COD"
                          ? "border-[#9A3F4D] bg-[#FDEAE6]/70"
                          : "border-[#eadbd4] bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          paymentMethod === "COD"
                            ? "border-[#9A3F4D] bg-[#9A3F4D] text-white"
                            : "border-[#cdbbb2]"
                        }`}
                      >
                        {paymentMethod === "COD" && <FiCheckCircle size={15} />}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#5B3B32]">
                          Cash on Delivery
                        </h3>
                        <p className="mt-1 text-sm text-[#75635c]">
                          Delivery ke time cash payment karein.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Razorpay")}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "Razorpay"
                          ? "border-[#9A3F4D] bg-[#FDEAE6]/70"
                          : "border-[#eadbd4] bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          paymentMethod === "Razorpay"
                            ? "border-[#9A3F4D] bg-[#9A3F4D] text-white"
                            : "border-[#cdbbb2]"
                        }`}
                      >
                        {paymentMethod === "Razorpay" && (
                          <FiCheckCircle size={15} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="text-[#9A3F4D]" />
                          <h3 className="font-bold text-[#5B3B32]">
                            Pay Online
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-[#75635c]">
                          UPI, Cards, Net Banking aur Wallet via Razorpay.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-[#FDEAE6] p-3 text-center">
                      <FiLock className="mx-auto text-[#9A3F4D]" />
                      <p className="mt-2 text-[10px] font-semibold text-[#5B3B32]">
                        Secure Payment
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FDEAE6] p-3 text-center">
                      <FiTruck className="mx-auto text-[#9A3F4D]" />
                      <p className="mt-2 text-[10px] font-semibold text-[#5B3B32]">
                        Free Delivery
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FDEAE6] p-3 text-center">
                      <FiCheckCircle className="mx-auto text-[#9A3F4D]" />
                      <p className="mt-2 text-[10px] font-semibold text-[#5B3B32]">
                        Easy Returns
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm lg:sticky lg:top-28">
                <h2 className="heading-font text-3xl text-[#5B3B32]">
                  Order Summary
                </h2>

                <div className="mt-5">
                  <CouponBox />
                </div>

                <div className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={
                        item.cartItemId ||
                        `${item._id || item.id}-${item.selectedSize || "Free Size"}`
                      }
                      className="flex gap-3 border-b border-[#eadbd4] pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-16 rounded-lg bg-[#FDEAE6] object-cover object-top"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-[#5B3B32]">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#75635c]">
                          Size: {item.selectedSize || "Free Size"} • Qty:{" "}
                          {item.qty || 1}
                        </p>
                        <p className="mt-1 font-bold text-[#9A3F4D]">
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.qty || 1)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 text-[#5B3B32]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      ₹{Number(cartTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between font-semibold text-green-700">
                      <span>Coupon Discount</span>
                      <span>
                        -₹{Number(discountAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>

                  <div className="flex justify-between border-t border-[#eadbd4] pt-4 text-xl font-bold">
                    <span>Total</span>
                    <span>
                      ₹{Number(finalTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={loading}
                  className="mt-6 hidden w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white disabled:opacity-60 lg:block"
                >
                  {loading
                    ? paymentMethod === "Razorpay"
                      ? "OPENING PAYMENT..."
                      : "PLACING ORDER..."
                    : paymentMethod === "Razorpay"
                    ? `PAY ₹${Number(finalTotal || 0).toLocaleString("en-IN")}`
                    : `PLACE ORDER • ₹${Number(finalTotal || 0).toLocaleString("en-IN")}`}
                </button>
              </aside>
            </div>
          </div>
        </Container>
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#eadbd4] bg-[#fffaf7]/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-[105px]">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[#8b746b]">
              TOTAL
            </p>
            <p className="text-lg font-bold text-[#9A3F4D]">
              ₹{Number(finalTotal || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={loading}
            className="flex-1 rounded-full bg-[#9A3F4D] py-3.5 font-bold text-white disabled:opacity-60"
          >
            {loading
              ? "PLEASE WAIT..."
              : paymentMethod === "Razorpay"
              ? "PAY NOW"
              : "PLACE ORDER"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CheckoutPayment;
