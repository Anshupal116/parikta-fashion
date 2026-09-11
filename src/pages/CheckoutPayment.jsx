import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiTruck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import CouponBox from "../components/CouponBox";
import CheckoutStepper from "../components/CheckoutStepper";

import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import { createOrder } from "../services/orderService";

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

  const {
    token,
    isLoggedIn,
    authLoading,
    selectedCheckoutAddress,
    addressesLoading,
    loadAddresses,
  } = useCustomer();

  // =====================================
  // UPI PAYMENT
  // =====================================

  const UPI_ID = "YOUR_UPI_ID@upi";
  const UPI_NAME = "Parikta Fashion";

  const [paymentMethod] = useState("UPI");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // PAYMENT POPUP
  // =====================================

  const [showPaymentPopup, setShowPaymentPopup] =
    useState(false);

  const [createdOrder, setCreatedOrder] =
    useState(null);

  // =====================================
  // SUCCESS REDIRECT PROTECTION
  // =====================================

  const orderSuccessRedirecting =
    useRef(false);

  // =====================================
  // OPEN ORDER SUCCESS
  // =====================================

  const openOrderSuccess = (
    order,
    method
  ) => {
    if (!order?.orderId) {
      throw new Error(
        "Order ID missing in server response"
      );
    }

    orderSuccessRedirecting.current = true;

    clearCart();

    navigate(
      `/order-success/${order.orderId}`,
      {
        replace: true,

        state: {
          order,
          paymentMethod: method,
        },
      }
    );
  };

  // =====================================
  // UPI PAYMENT URL
  //
  // IMPORTANT:
  // QR URL tabhi banega jab createdOrder
  // available hoga.
  //
  // Isliye page load hote hi QR generate
  // nahi hoga.
  // =====================================

  const upiPaymentUrl = createdOrder
    ? `upi://pay?pa=${encodeURIComponent(
        UPI_ID
      )}&pn=${encodeURIComponent(
        UPI_NAME
      )}&am=${Number(
        createdOrder.amount || 0
      ).toFixed(2)}&cu=INR`
    : "";

  // =====================================
  // AUTH / ADDRESS CHECK
  // =====================================

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !token) {
      navigate("/login", {
        replace: true,

        state: {
          from: "/checkout/payment",
        },
      });

      return;
    }

    if (
      cartItems.length === 0 &&
      !orderSuccessRedirecting.current
    ) {
      navigate("/cart", {
        replace: true,
      });

      return;
    }

    loadAddresses();
  }, [
    authLoading,
    isLoggedIn,
    token,
    cartItems.length,
    navigate,
    loadAddresses,
  ]);

  // =====================================
  // CHECK SELECTED ADDRESS
  // =====================================

  useEffect(() => {
    if (
      !authLoading &&
      isLoggedIn &&
      !addressesLoading &&
      !selectedCheckoutAddress
    ) {
      navigate("/checkout/address", {
        replace: true,
      });
    }
  }, [
    authLoading,
    isLoggedIn,
    addressesLoading,
    selectedCheckoutAddress,
    navigate,
  ]);

  // =====================================
  // PLACE ORDER
  //
  // IMPORTANT:
  // Order sirf PAY VIA UPI click hone par
  // create hoga.
  //
  // Page load par koi order create nahi hoga.
  // =====================================

  const placeOrder = async () => {
    if (!isLoggedIn || !token) {
      navigate("/login", {
        state: {
          from: "/checkout/payment",
        },
      });

      return;
    }

    if (!selectedCheckoutAddress) {
      navigate("/checkout/address");

      return;
    }

    if (cartItems.length === 0) {
      navigate("/cart", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      // =====================================
      // ORDER DATA
      // =====================================

      const orderData = {
        customer: {
          name:
            selectedCheckoutAddress.name.trim(),

          phone:
            selectedCheckoutAddress.phone.trim(),

          email:
            (
              selectedCheckoutAddress.email ||
              ""
            ).trim(),
        },

        address: {
          house: `${selectedCheckoutAddress.house}, ${
            selectedCheckoutAddress.area
          }${
            selectedCheckoutAddress.landmark
              ? `, ${selectedCheckoutAddress.landmark}`
              : ""
          }`,

          city:
            selectedCheckoutAddress.city.trim(),

          state:
            selectedCheckoutAddress.state.trim(),

          pincode:
            selectedCheckoutAddress.pincode.trim(),
        },

        items: cartItems.map((item) => ({
          productId:
            item._id || item.id,

          name: item.name,

          image: item.image,

          price: Number(
            item.price || 0
          ),

          qty: Number(
            item.qty || 1
          ),

          selectedSize:
            item.selectedSize ||
            "Free Size",
        })),

        subtotal:
          Number(cartTotal || 0),

        discountAmount:
          Number(discountAmount || 0),

        amount:
          Number(finalTotal || 0),

        couponCode:
          appliedCoupon?.coupon?.code ||
          "",

        couponId:
          appliedCoupon?.coupon?._id ||
          null,

        // =====================================
        // PAYMENT METHOD
        // =====================================

        paymentMethod: "UPI",

        customerAddressId:
          selectedCheckoutAddress._id ||
          selectedCheckoutAddress.id,
      };

      // =====================================
      // CREATE ORDER
      //
      // YAHI REQUEST PAY BUTTON CLICK PAR
      // JA RAHI HAI.
      // =====================================

      const response =
        await createOrder(
          orderData,
          token
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Order failed"
        );
      }

      const appOrder =
        response.order;

      if (!appOrder?.orderId) {
        throw new Error(
          "Order ID missing"
        );
      }

      // =====================================
      // ORDER CREATE HO GAYA
      // ABHI PAYMENT POPUP OPEN HOGA
      // =====================================

      setCreatedOrder(
        appOrder
      );

      setShowPaymentPopup(
        true
      );
    } catch (orderError) {
      console.error(
        "Order place error:",
        orderError
      );

      setError(
        orderError.response?.data
          ?.message ||
          orderError.message ||
          "Server error. Order place nahi hua."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // CUSTOMER SAYS PAYMENT COMPLETED
  // =====================================

  const handlePaymentCompleted = () => {
    if (!createdOrder) {
      return;
    }

    setShowPaymentPopup(false);

    // =====================================
    // TEMPORARY UPI SYSTEM
    //
    // Payment automatically verify nahi ho
    // rahi hai.
    //
    // Admin manually verify karega.
    // =====================================

    openOrderSuccess(
      createdOrder,
      "UPI"
    );
  };

  // =====================================
  // CLOSE PAYMENT POPUP
  // =====================================

  const closePaymentPopup = () => {
    setShowPaymentPopup(false);
  };

  // =====================================
  // NO ADDRESS
  // =====================================

  if (!selectedCheckoutAddress) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee] pb-36 pt-4 sm:pt-6 md:pb-14 md:pt-10">
        <Container>
          <div className="mx-auto max-w-6xl">

            {/* =====================================
                HEADER
            ===================================== */}

            <div className="mb-5 grid grid-cols-[44px_1fr_44px] items-center gap-2 sm:mb-7">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/checkout/address"
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4] bg-white text-[#5B3B32]"
              >
                <FiArrowLeft
                  size={21}
                />
              </button>

              <div className="min-w-0 text-center">

                <h1 className="heading-font text-[2rem] leading-tight text-[#5B3B32] sm:text-3xl md:text-4xl">
                  Payment
                </h1>

                <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-[#BFA996] sm:text-xs">
                  STEP 3 OF 3
                </p>

              </div>

              <div className="h-11 w-11" />

            </div>

            {/* =====================================
                STEPPER
            ===================================== */}

            <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-4 sm:mb-8 sm:p-5">
              <CheckoutStepper
                activeStep="payment"
              />
            </div>

            {/* =====================================
                MAIN GRID
            ===================================== */}

            <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7">

              {/* =====================================
                  LEFT
              ===================================== */}

              <section className="min-w-0 space-y-5">

                {/* =====================================
                    ADDRESS
                ===================================== */}

                <div className="rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-sm sm:p-5 md:rounded-3xl md:p-7">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                        DELIVER TO
                      </p>

                      <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                        {
                          selectedCheckoutAddress.name
                        }
                      </h2>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/checkout/address"
                        )
                      }
                      className="font-bold text-[#9A3F4D]"
                    >
                      Change
                    </button>

                  </div>

                  <p className="mt-4 leading-6 text-[#75635c]">

                    {
                      selectedCheckoutAddress.house
                    }
                    ,{" "}
                    {
                      selectedCheckoutAddress.area
                    }

                    {
                      selectedCheckoutAddress.landmark
                        ? `, ${selectedCheckoutAddress.landmark}`
                        : ""
                    }

                    <br />

                    {
                      selectedCheckoutAddress.city
                    }
                    ,{" "}
                    {
                      selectedCheckoutAddress.state
                    }{" "}
                    -{" "}
                    {
                      selectedCheckoutAddress.pincode
                    }

                  </p>

                  <p className="mt-2 font-semibold text-[#5B3B32]">

                    Mobile:{" "}
                    {
                      selectedCheckoutAddress.phone
                    }

                  </p>

                </div>

                {/* =====================================
                    PAYMENT
                ===================================== */}

                <div className="rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-sm sm:p-5 md:rounded-3xl md:p-7">

                  <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                    PAYMENT METHOD
                  </p>

                  <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                    Pay via UPI
                  </h2>

                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {error}
                    </div>
                  )}

                  {/* =====================================
                      UPI OPTION
                  ===================================== */}

                  <div className="mt-6 rounded-2xl border border-[#9A3F4D] bg-[#FDEAE6]/70 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#9A3F4D] shadow-sm">
                        <FiCreditCard
                          size={20}
                        />
                      </div>

                      <div>

                        <h3 className="font-bold text-[#5B3B32]">
                          UPI Payment
                        </h3>

                        <p className="mt-1 text-sm text-[#75635c]">
                          Google Pay,
                          PhonePe,
                          Paytm, BHIM
                          aur other UPI
                          apps
                        </p>

                      </div>

                    </div>

                    {/* =====================================
                        AMOUNT
                    ===================================== */}

                    <div className="mt-6 text-center">

                      <p className="text-xs font-semibold tracking-[0.16em] text-[#BFA996]">
                        AMOUNT TO PAY
                      </p>

                      <p className="mt-1 text-3xl font-bold text-[#9A3F4D]">

                        ₹
                        {Number(
                          finalTotal || 0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </p>

                    </div>

                    {/* =====================================
                        QR REMOVED FROM HERE
                        
                        IMPORTANT:
                        Ab page load par QR nahi dikhega.
                        
                        QR sirf popup ke andar
                        PAY VIA UPI click ke baad
                        dikhega.
                    ===================================== */}

                    <div className="mt-6 rounded-xl bg-white px-4 py-4 text-center">

                      <p className="text-sm font-semibold text-[#5B3B32]">
                        Ready to pay?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#75635c]">
                        "PAY VIA UPI" button
                        dabane ke baad
                        payment QR code
                        generate hoga.
                      </p>

                    </div>

                  </div>

                  {/* =====================================
                      SECURITY FEATURES
                  ===================================== */}

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

              {/* =====================================
                  ORDER SUMMARY
              ===================================== */}

              <aside className="min-w-0 rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-sm sm:p-6 md:rounded-3xl lg:sticky lg:top-28">

                <h2 className="heading-font text-3xl text-[#5B3B32]">
                  Order Summary
                </h2>

                <div className="mt-5">
                  <CouponBox />
                </div>

                <div className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">

                  {cartItems.map(
                    (item) => (
                      <div
                        key={
                          item.cartItemId ||
                          `${item._id || item.id}-${
                            item.selectedSize ||
                            "Free Size"
                          }`
                        }
                        className="flex min-w-0 gap-3 border-b border-[#eadbd4] pb-4"
                      >

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="h-20 w-16 rounded-lg bg-[#FDEAE6] object-cover object-top"
                        />

                        <div className="min-w-0 flex-1">

                          <h3 className="line-clamp-2 break-words font-bold text-[#5B3B32]">
                            {
                              item.name
                            }
                          </h3>

                          <p className="mt-1 text-xs text-[#75635c]">

                            Size:{" "}
                            {
                              item.selectedSize ||
                              "Free Size"
                            }

                            {" • "}

                            Qty:{" "}
                            {
                              item.qty ||
                              1
                            }

                          </p>

                          <p className="mt-1 font-bold text-[#9A3F4D]">

                            ₹
                            {(
                              Number(
                                item.price ||
                                  0
                              ) *
                              Number(
                                item.qty ||
                                  1
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>

                {/* =====================================
                    TOTALS
                ===================================== */}

                <div className="mt-6 space-y-3 text-[#5B3B32]">

                  <div className="flex justify-between">

                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹
                      {Number(
                        cartTotal || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  {discountAmount >
                    0 && (
                    <div className="flex justify-between font-semibold text-green-700">

                      <span>
                        Coupon Discount
                      </span>

                      <span>
                        -₹
                        {Number(
                          discountAmount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>
                  )}

                  <div className="flex justify-between">

                    <span>
                      Delivery
                    </span>

                    <span className="font-bold text-green-600">
                      Free
                    </span>

                  </div>

                  <div className="flex justify-between border-t border-[#eadbd4] pt-4 text-xl font-bold">

                    <span>
                      Total
                    </span>

                    <span>
                      ₹
                      {Number(
                        finalTotal || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>

                {/* =====================================
                    DESKTOP PAY BUTTON
                ===================================== */}

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={loading}
                  className="mt-6 hidden w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white disabled:opacity-60 lg:block"
                >

                  {loading
                    ? "CREATING ORDER..."
                    : `PAY ₹${Number(
                        finalTotal || 0
                      ).toLocaleString(
                        "en-IN"
                      )}`}

                </button>

              </aside>

            </div>

          </div>
        </Container>
      </main>

      {/* =====================================
          MOBILE BOTTOM BUTTON
      ===================================== */}

      <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-[#eadbd4] bg-[#fffaf7]/96 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(91,59,50,0.12)] backdrop-blur-md lg:hidden">

        <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr] items-center gap-2.5">

          <div className="min-w-[88px]">

            <p className="text-[8px] font-semibold tracking-[0.13em] text-[#8b746b]">
              TOTAL
            </p>

            <p className="text-base font-bold text-[#9A3F4D]">
              ₹
              {Number(
                finalTotal || 0
              ).toLocaleString(
                "en-IN"
              )}
            </p>

          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={loading}
            className="min-h-12 min-w-0 rounded-xl bg-[#9A3F4D] px-3 py-3 text-[11px] font-bold text-white active:scale-[0.98] disabled:opacity-60 sm:text-sm"
          >

            {loading
              ? "PLEASE WAIT..."
              : "PAY VIA UPI"}

          </button>

        </div>

      </div>

      {/* =====================================
          UPI PAYMENT POPUP
          
          QR SIRF YAHAN HAI
          
          showPaymentPopup true tabhi hoga
          jab PAY VIA UPI click karke
          order create ho jayega.
      ===================================== */}

      {showPaymentPopup &&
        createdOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[#fffaf7] shadow-2xl">

              {/* =====================================
                  HEADER
              ===================================== */}

              <div className="bg-[#9A3F4D] px-6 py-5 text-center text-white">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">

                  <FiCreditCard
                    size={26}
                  />

                </div>

                <h2 className="heading-font mt-3 text-2xl">
                  Complete UPI Payment
                </h2>

                <p className="mt-1 text-sm text-white/80">
                  Order #
                  {
                    createdOrder.orderId
                  }
                </p>

              </div>

              <div className="p-6">

                {/* =====================================
                    AMOUNT
                ===================================== */}

                <div className="text-center">

                  <p className="text-xs font-semibold tracking-[0.16em] text-[#BFA996]">
                    PAY EXACT AMOUNT
                  </p>

                  <p className="mt-1 text-4xl font-bold text-[#9A3F4D]">

                    ₹
                    {Number(
                      createdOrder.amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </p>

                </div>

                {/* =====================================
                    QR
                    ONLY GENERATED HERE
                ===================================== */}

                {upiPaymentUrl && (
                  <div className="mt-5 flex justify-center">

                    <div className="rounded-2xl border border-[#eadbd4] bg-white p-4 shadow-sm">

                      <QRCodeSVG
                        value={
                          upiPaymentUrl
                        }
                        size={210}
                        level="H"
                        includeMargin
                      />

                    </div>

                  </div>
                )}

                <p className="mt-4 text-center text-sm text-[#75635c]">
                  Scan with Google Pay,
                  PhonePe, Paytm or
                  any UPI app
                </p>

                {/* =====================================
                    UPI ID
                ===================================== */}

                <div className="mt-4 rounded-xl bg-[#f7f2ee] p-3 text-center">

                  <p className="text-[10px] font-semibold tracking-[0.15em] text-[#BFA996]">
                    UPI ID
                  </p>

                  <p className="mt-1 font-bold text-[#5B3B32]">
                    {UPI_ID}
                  </p>

                </div>

                {/* =====================================
                    MOBILE UPI APP
                ===================================== */}

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      upiPaymentUrl;
                  }}
                  className="mt-4 w-full rounded-xl bg-[#9A3F4D] py-3.5 font-bold text-white md:hidden"
                >
                  OPEN UPI APP
                </button>

                {/* =====================================
                    PAYMENT WARNING
                ===================================== */}

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                  <p className="text-xs leading-5 text-amber-800">

                    Payment karne ke
                    baad hi
                    "I HAVE PAID"
                    button dabayein.
                    Payment bank
                    account mein
                    verify hone ke
                    baad order confirm
                    kiya jayega.

                  </p>

                </div>

                {/* =====================================
                    I HAVE PAID
                ===================================== */}

                <button
                  type="button"
                  onClick={
                    handlePaymentCompleted
                  }
                  className="mt-4 w-full rounded-xl border border-[#9A3F4D] bg-white py-3.5 font-bold text-[#9A3F4D] transition hover:bg-[#FDEAE6]"
                >
                  I HAVE PAID
                </button>

                {/* =====================================
                    CLOSE
                ===================================== */}

                <button
                  type="button"
                  onClick={
                    closePaymentPopup
                  }
                  className="mt-3 w-full py-2 text-sm font-semibold text-[#8b746b]"
                >
                  Pay Later / Close
                </button>

              </div>

            </div>

          </div>
        )}

      <Footer />
    </>
  );
}

export default CheckoutPayment;