import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { getOrderById } from "../services/orderService";
import { generateInvoicePDF } from "../utils/invoiceGenerator";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEstimatedDelivery = (createdAt) => {
  const base = createdAt ? new Date(createdAt) : new Date();
  const start = new Date(base);
  const end = new Date(base);

  start.setDate(start.getDate() + 4);
  end.setDate(end.getDate() + 7);

  return `${start.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })} - ${end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
};

const getStatusStep = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized.includes("delivered")) return 5;
  if (normalized.includes("out for delivery")) return 4;
  if (normalized.includes("shipped")) return 3;
  if (normalized.includes("packed") || normalized.includes("processing")) return 2;
  if (normalized.includes("confirmed") || normalized.includes("paid")) return 1;

  return 0;
};

function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12.5 9.2 16.5 19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M3 6h11v10H3V6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 10h4l3 3v3h-7v-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.8 2.8 8.2 7 10 4.2-1.8 7-5.2 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OrderSuccess() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrderById(orderId);

        if (response?.success && response?.order) {
          setOrder(response.order);
        } else {
          setError(response?.message || "Order details not found.");
        }
      } catch (err) {
        console.error("Order success page error:", err);
        setError(err?.response?.data?.message || "Unable to load your order details.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) loadOrder();
  }, [orderId]);

  const isOnlinePayment = useMemo(() => {
    const method = String(order?.paymentMethod || "").toLowerCase();
    return method.includes("razorpay") || method.includes("online") || method.includes("upi") || method.includes("card");
  }, [order]);

  const isPaid = useMemo(() => {
    const paymentStatus = String(order?.paymentStatus || "").toLowerCase();
    return paymentStatus === "paid" || paymentStatus === "captured";
  }, [order]);

  const statusStep = getStatusStep(order?.status);
  const estimatedDelivery = getEstimatedDelivery(order?.createdAt);

  const handleInvoiceDownload = async () => {
    if (!order || downloading) return;

    try {
      setDownloading(true);
      await generateInvoicePDF(order);
    } catch (err) {
      console.error("Invoice download failed:", err);
      alert("Invoice download nahi ho paayi. Please dobara try karein.");
    } finally {
      setDownloading(false);
    }
  };

  const timeline = [
    { title: "Order Received", description: "Your order has been placed successfully." },
    { title: "Payment Confirmed", description: isOnlinePayment ? "Your online payment has been verified." : "Cash on Delivery order confirmed." },
    { title: "Preparing Order", description: "Your items are being packed with care." },
    { title: "Shipped", description: "Your package is on the way." },
    { title: "Delivered", description: "Order delivered to your address." },
  ];

  return (
    <>
      <Navbar />

      <style>{`
        @keyframes premiumSuccessPop {
          0% { transform: scale(.45); opacity: 0; }
          65% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes premiumFadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes premiumPulseRing {
          0% { transform: scale(.88); opacity: .8; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        @keyframes premiumFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .premium-success-pop { animation: premiumSuccessPop .75s cubic-bezier(.2,.8,.2,1) both; }
        .premium-fade-up { animation: premiumFadeUp .7s ease both; }
        .premium-pulse-ring { animation: premiumPulseRing 1.8s ease-out infinite; }
        .premium-float { animation: premiumFloat 5s ease-in-out infinite; }
      `}</style>

      <main className="relative min-h-screen overflow-hidden bg-[#f7f2ee] py-10 md:py-16">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#FDEAE6] blur-3xl opacity-80" />
        <div className="pointer-events-none absolute -right-20 top-52 h-80 w-80 rounded-full bg-[#eadbd4] blur-3xl opacity-60" />

        <Container>
          <section className="mx-auto max-w-6xl">
            <div className="premium-fade-up relative overflow-hidden rounded-[34px] border border-white/80 bg-gradient-to-br from-[#fffaf7] via-white to-[#FDEAE6] px-6 py-10 text-center shadow-[0_25px_80px_rgba(91,59,50,0.14)] md:px-12 md:py-14">
              <div className="absolute left-8 top-8 h-2 w-2 rounded-full bg-[#9A3F4D]/20 premium-float" />
              <div className="absolute right-12 top-16 h-3 w-3 rounded-full bg-[#BFA996]/30 premium-float" />
              <div className="absolute bottom-10 left-1/4 h-2.5 w-2.5 rounded-full bg-[#9A3F4D]/20 premium-float" />

              <div className="relative mx-auto h-28 w-28">
                <div className="premium-pulse-ring absolute inset-0 rounded-full bg-[#9A3F4D]/20" />
                <div className="premium-success-pop relative flex h-28 w-28 items-center justify-center rounded-full bg-[#9A3F4D] text-white shadow-[0_16px_45px_rgba(154,63,77,0.35)]">
                  <CheckIcon className="h-14 w-14" />
                </div>
              </div>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#BFA996] md:text-sm">
                Order Confirmed
              </p>

              <h1 className="heading-font mt-3 text-4xl leading-tight text-[#5B3B32] md:text-6xl">
                Thank You For Shopping With Us
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#8b746b] md:text-lg">
                Your order has been placed successfully. We are preparing it with care and will keep you updated at every step.
              </p>

              <div className="mx-auto mt-7 inline-flex max-w-full items-center gap-3 rounded-2xl border border-[#eadbd4] bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                <span className="text-sm text-[#8b746b]">Order ID</span>
                <span className="truncate font-bold text-[#9A3F4D]">{orderId}</span>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 rounded-[28px] border border-[#eadbd4] bg-white p-8 shadow-sm">
                <div className="space-y-4 animate-pulse">
                  <div className="h-5 w-48 rounded bg-[#FDEAE6]" />
                  <div className="h-28 rounded-2xl bg-[#f7f2ee]" />
                  <div className="h-28 rounded-2xl bg-[#f7f2ee]" />
                </div>
              </div>
            ) : error || !order ? (
              <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                <h2 className="text-xl font-bold text-red-700">Order details unavailable</h2>
                <p className="mt-2 text-red-600">{error || "Order details not found."}</p>
                <Link to="/my-orders" className="mt-5 inline-flex rounded-xl bg-[#9A3F4D] px-6 py-3 font-semibold text-white">
                  View My Orders
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid gap-7 lg:grid-cols-[1.3fr_.7fr]">
                <div className="space-y-7">
                  <section className="premium-fade-up rounded-[28px] border border-[#eadbd4] bg-white p-6 shadow-[0_18px_45px_rgba(91,59,50,0.08)] md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#BFA996]">Payment Summary</p>
                        <h2 className="mt-2 text-2xl font-bold text-[#5B3B32]">
                          {isOnlinePayment ? (isPaid ? "Payment Received" : "Online Payment") : "Cash on Delivery"}
                        </h2>
                      </div>

                      <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${isOnlinePayment && isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${isOnlinePayment && isPaid ? "bg-green-500" : "bg-amber-500"}`} />
                        {isOnlinePayment ? (order.paymentStatus || "Pending") : "COD Confirmed"}
                      </div>
                    </div>

                    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Amount", money(order.amount)],
                        ["Payment Method", order.paymentMethod || "-"],
                        ["Order Date", formatDate(order.createdAt)],
                        ["Order Status", order.status || "Confirmed"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-4">
                          <p className="text-sm text-[#8b746b]">{label}</p>
                          <p className="mt-2 break-words font-bold text-[#5B3B32]">{value}</p>
                        </div>
                      ))}
                    </div>

                    {isOnlinePayment && order.razorpayPaymentId && (
                      <div className="mt-4 rounded-2xl bg-[#f7f2ee] px-4 py-3 text-sm text-[#8b746b]">
                        Payment ID: <span className="font-semibold text-[#5B3B32]">{order.razorpayPaymentId}</span>
                      </div>
                    )}

                    {!isOnlinePayment && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Please keep <strong>{money(order.amount)}</strong> ready at the time of delivery.
                      </div>
                    )}
                  </section>

                  <section className="premium-fade-up rounded-[28px] border border-[#eadbd4] bg-white p-6 shadow-[0_18px_45px_rgba(91,59,50,0.08)] md:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#BFA996]">Order Journey</p>
                        <h2 className="mt-2 text-2xl font-bold text-[#5B3B32]">Delivery Timeline</h2>
                      </div>
                      <div className="hidden rounded-2xl bg-[#FDEAE6] p-3 text-[#9A3F4D] sm:block">
                        <TruckIcon />
                      </div>
                    </div>

                    <div className="mt-8 space-y-0">
                      {timeline.map((item, index) => {
                        const active = index <= statusStep;
                        const isLast = index === timeline.length - 1;

                        return (
                          <div key={item.title} className="relative flex gap-4 pb-7 last:pb-0">
                            {!isLast && (
                              <div className={`absolute left-[17px] top-9 h-[calc(100%-12px)] w-0.5 ${index < statusStep ? "bg-[#9A3F4D]" : "bg-[#eadbd4]"}`} />
                            )}

                            <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-[#9A3F4D] bg-[#9A3F4D] text-white" : "border-[#eadbd4] bg-white text-[#BFA996]"}`}>
                              {active ? <CheckIcon className="h-5 w-5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                            </div>

                            <div>
                              <h3 className={`font-bold ${active ? "text-[#5B3B32]" : "text-[#BFA996]"}`}>{item.title}</h3>
                              <p className="mt-1 text-sm leading-6 text-[#8b746b]">{item.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="premium-fade-up rounded-[28px] border border-[#eadbd4] bg-white p-6 shadow-[0_18px_45px_rgba(91,59,50,0.08)] md:p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#BFA996]">Order Details</p>
                        <h2 className="mt-2 text-2xl font-bold text-[#5B3B32]">Your Items</h2>
                      </div>
                      <span className="rounded-full bg-[#FDEAE6] px-3 py-1 text-sm font-bold text-[#9A3F4D]">
                        {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      {(order.items || []).map((item, index) => {
                        const quantity = Number(item.qty || item.quantity || 1);
                        const image = item.image || item.productImage || item.product?.image;

                        return (
                          <div key={item._id || `${item.name}-${index}`} className="flex gap-4 rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-4">
                            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#FDEAE6]">
                              {image ? (
                                <img src={image} alt={item.name || "Product"} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#9A3F4D]">
                                  <ShoppingBagIcon />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="font-bold text-[#5B3B32]">{item.name || "Product"}</h3>
                                  <p className="mt-1 text-sm text-[#8b746b]">
                                    Size: {item.selectedSize || item.size || "Free Size"} · Qty: {quantity}
                                  </p>
                                </div>
                                <p className="font-bold text-[#9A3F4D]">{money(Number(item.price || 0) * quantity)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <aside className="space-y-7">
                  <section className="premium-fade-up rounded-[28px] border border-[#eadbd4] bg-[#5B3B32] p-6 text-white shadow-[0_18px_45px_rgba(91,59,50,0.18)] md:p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E7CFC5]">Estimated Delivery</p>
                    <h2 className="mt-3 text-3xl font-bold">{estimatedDelivery}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#f6e9e4]">Free shipping · Secure packaging · Live order tracking</p>

                    <Link to={`/track-order/${orderId}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-[#5B3B32] transition hover:bg-[#FDEAE6]">
                      <TruckIcon />
                      Track Order
                    </Link>
                  </section>

                  <section className="premium-fade-up rounded-[28px] border border-[#eadbd4] bg-white p-6 shadow-[0_18px_45px_rgba(91,59,50,0.08)] md:p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#BFA996]">Delivering To</p>
                    <h2 className="mt-2 text-xl font-bold text-[#5B3B32]">{order.customer?.name || "Customer"}</h2>

                    <div className="mt-4 space-y-2 text-sm leading-6 text-[#8b746b]">
                      {order.customer?.phone && <p>{order.customer.phone}</p>}
                      {order.customer?.email && <p className="break-all">{order.customer.email}</p>}
                      <p>
                        {[
                          order.address?.house,
                          order.address?.area,
                          order.address?.city,
                          order.address?.state,
                          order.address?.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address unavailable"}
                      </p>
                    </div>
                  </section>

                  <section className="premium-fade-up rounded-[28px] border border-[#eadbd4] bg-white p-6 shadow-[0_18px_45px_rgba(91,59,50,0.08)] md:p-7">
                    <h2 className="text-xl font-bold text-[#5B3B32]">Quick Actions</h2>

                    <div className="mt-5 space-y-3">
                      <button
                        type="button"
                        onClick={handleInvoiceDownload}
                        disabled={downloading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9A3F4D] px-5 py-3.5 font-bold text-white transition hover:bg-[#7d3140] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <DownloadIcon />
                        {downloading ? "Preparing Invoice..." : "Download Invoice"}
                      </button>

                      <Link to="/my-orders" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#9A3F4D] px-5 py-3.5 font-bold text-[#9A3F4D] transition hover:bg-[#FDEAE6]">
                        <ShoppingBagIcon />
                        My Orders
                      </Link>

                      <Link to="/products" className="flex w-full items-center justify-center rounded-xl border border-[#eadbd4] bg-[#fffaf7] px-5 py-3.5 font-bold text-[#5B3B32] transition hover:bg-[#f7f2ee]">
                        Continue Shopping
                      </Link>
                    </div>
                  </section>
                </aside>
              </div>
            )}

            <section className="premium-fade-up mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [<ShieldIcon key="secure" />, "Secure Payment", "Protected checkout"],
                [<CheckIcon key="quality" className="h-5 w-5" />, "Premium Quality", "Carefully selected products"],
                [<ShoppingBagIcon key="returns" />, "Easy Returns", "Simple support process"],
                [<TruckIcon key="delivery" />, "Fast Delivery", "Reliable doorstep delivery"],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-2xl border border-[#eadbd4] bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEAE6] text-[#9A3F4D]">{icon}</div>
                  <h3 className="mt-4 font-bold text-[#5B3B32]">{title}</h3>
                  <p className="mt-1 text-sm text-[#8b746b]">{text}</p>
                </div>
              ))}
            </section>
          </section>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default OrderSuccess;