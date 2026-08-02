import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBox,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiStar,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import WriteReviewModal from "../components/reviews/WriteReviewModal";

import { useCustomer } from "../context/CustomerContext";
import {
  getMyOrders,
  cancelMyOrder,
  downloadInvoice,
} from "../services/orderService";


import {
  checkReviewEligibility,
} from "../services/reviewService";

const statusSteps = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
];

function MyOrders() {
  const navigate = useNavigate();
  const { token, isLoggedIn, authLoading } = useCustomer();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");

  const [reviewStatusByProduct, setReviewStatusByProduct] = useState({});
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await getMyOrders(token);

      if (response.success) {
        setOrders(response.orders || []);
      } else {
        alert(response.message || "Orders load failed");
      }
    } catch (error) {
      console.error("My orders error:", error);
      alert(
        error.response?.data?.message || "Orders load nahi hue"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !token) {
      navigate("/login", {
        replace: true,
        state: {
          from: window.location.pathname,
        },
      });

      return;
    }

    loadOrders();
  }, [authLoading, isLoggedIn, token, navigate]);

  useEffect(() => {
    if (!isLoggedIn || !token || orders.length === 0) return;

    const deliveredProductIds = [
      ...new Set(
        orders
          .filter((order) => order.status === "Delivered")
          .flatMap((order) => order.items || [])
          .map((item) => item.productId)
          .filter(Boolean)
      ),
    ];

    if (deliveredProductIds.length === 0) return;

    let active = true;

    const loadReviewStatuses = async () => {
      const loadingState = {};

      deliveredProductIds.forEach((productId) => {
        loadingState[productId] = {
          loading: true,
        };
      });

      setReviewStatusByProduct((current) => ({
        ...current,
        ...loadingState,
      }));

      const results = await Promise.allSettled(
        deliveredProductIds.map(async (productId) => {
          const response = await checkReviewEligibility(productId);
          return { productId, response };
        })
      );

      if (!active) return;

      setReviewStatusByProduct((current) => {
        const nextState = { ...current };

        results.forEach((result, index) => {
          const productId = deliveredProductIds[index];

          if (result.status === "fulfilled") {
            nextState[result.value.productId] = {
              loading: false,
              ...result.value.response,
            };
          } else {
            nextState[productId] = {
              loading: false,
              eligible: false,
              alreadyReviewed: false,
              message:
                result.reason?.response?.data?.message ||
                "Review status check failed",
            };
          }
        });

        return nextState;
      });
    };

    loadReviewStatuses();

    return () => {
      active = false;
    };
  }, [orders, isLoggedIn, token]);

const handleDownloadInvoice = async (orderId) => {
  try {
    await downloadInvoice(orderId, token);
  } catch (error) {
    console.error("Invoice download error:", error);
    alert(error.message || "Invoice download failed");
  }
};

  const refreshReviewStatus = async (productId) => {
    if (!productId) return;

    try {
      setReviewStatusByProduct((current) => ({
        ...current,
        [productId]: {
          ...(current[productId] || {}),
          loading: true,
        },
      }));

      const response = await checkReviewEligibility(productId);

      setReviewStatusByProduct((current) => ({
        ...current,
        [productId]: {
          loading: false,
          ...response,
        },
      }));
    } catch (error) {
      console.error("Review eligibility refresh error:", error);

      setReviewStatusByProduct((current) => ({
        ...current,
        [productId]: {
          loading: false,
          eligible: false,
          alreadyReviewed: false,
          message:
            error.response?.data?.message ||
            "Review status check failed",
        },
      }));
    }
  };

  const openReviewModal = (item) => {
    if (!item?.productId) return;

    setSelectedReviewProduct({
      productId: item.productId,
      name: item.name,
      image: item.image,
    });
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedReviewProduct(null);
  };

  const handleReviewSuccess = async () => {
    const productId = selectedReviewProduct?.productId;

    closeReviewModal();

    if (productId) {
      await refreshReviewStatus(productId);
    }
  };

  const handleCancelOrder = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancellingId(id);

      const response = await cancelMyOrder(id, token);

      if (response.success) {
        alert("Order cancelled successfully");
        loadOrders();
      } else {
        alert(response.message || "Order cancel failed");
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Order cancel nahi hua"
      );
    } finally {
      setCancellingId("");
    }
  };

  const totalOrders = orders.length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const activeOrders = orders.filter((order) =>
    ["Pending", "Confirmed", "Shipped"].includes(order.status)
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const getStatusClass = (status) => {
    const classes = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      Shipped: "bg-purple-100 text-purple-700",
      Delivered: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return classes[status] || "bg-gray-100 text-gray-700";
  };

  const renderReviewAction = (item) => {
    if (!item?.productId) {
      return (
        <p className="text-xs text-[#8b746b] mt-3">
          Review is unavailable for this product.
        </p>
      );
    }

    const reviewStatus = reviewStatusByProduct[item.productId];

    if (!reviewStatus || reviewStatus.loading) {
      return (
        <p className="text-xs text-[#8b746b] mt-3">
          Checking review status...
        </p>
      );
    }

    if (reviewStatus.alreadyReviewed) {
      return (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openReviewModal(item)}
            className="inline-flex items-center gap-2 border border-[#9A3F4D] text-[#9A3F4D] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#fff1f3] transition"
          >
            <FiEdit3 />
            Edit Review
          </button>

          <span className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-full font-semibold">
            {reviewStatus.review?.status || "Pending"}
          </span>
        </div>
      );
    }

    if (reviewStatus.eligible) {
      return (
        <button
          type="button"
          onClick={() => openReviewModal(item)}
          className="mt-4 inline-flex items-center gap-2 bg-[#9A3F4D] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7d1930] transition"
        >
          <FiStar />
          Write Review
        </button>
      );
    }

    return (
      <p className="text-xs text-[#8b746b] mt-3">
        {reviewStatus.message ||
          "Review is available after product delivery."}
      </p>
    );
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f2ee] px-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

            <h1 className="heading-font mt-5 text-3xl text-[#5B3B32] sm:text-4xl">
              Loading Orders...
            </h1>

            <p className="mt-2 text-sm text-[#8b746b]">
              Your order history is being prepared.
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee] pb-24 pt-4 sm:pt-6 md:pb-14 md:pt-10">
        <Container>
          <div className="mb-6 sm:mb-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#BFA996] sm:text-xs sm:tracking-[0.28em]">
              Customer Account
            </p>

            <h1 className="heading-font mt-2 text-[2.35rem] leading-tight text-[#5B3B32] sm:text-5xl md:text-6xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#8b746b] sm:mt-3 sm:text-base">
              View, track and manage all your Parikta orders.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-9 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: "Total Orders",
                value: totalOrders,
                icon: FiBox,
              },
              {
                label: "Active Orders",
                value: activeOrders,
                icon: FiClock,
              },
              {
                label: "Delivered",
                value: deliveredOrders,
                icon: FiCheckCircle,
              },
              {
                label: "Cancelled",
                value: cancelledOrders,
                icon: FiXCircle,
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-[0_10px_28px_rgba(91,59,50,0.05)] sm:rounded-3xl sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="heading-font text-3xl text-[#9A3F4D] sm:text-4xl">
                        {stat.value}
                      </h2>

                      <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5B3B32] sm:mt-2 sm:text-xs sm:tracking-[0.16em]">
                        {stat.label}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D] sm:h-12 sm:w-12">
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {orders.length === 0 ? (
            <div className="rounded-[28px] border border-[#eadbd4] bg-[#fffaf7] px-5 py-12 text-center shadow-[0_18px_45px_rgba(91,59,50,0.06)] sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]">
                <FiBox size={34} />
              </div>

              <h2 className="heading-font mt-6 text-3xl text-[#5B3B32] sm:text-4xl">
                No Orders Yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#8b746b] sm:mt-3 sm:text-base">
                Your placed orders will appear here.
              </p>

              <Link to="/products">
                <button className="mt-7 min-h-12 w-full rounded-xl bg-[#9A3F4D] px-8 py-4 font-bold text-white transition active:scale-[0.98] sm:w-auto">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {orders.map((order) => {
                const currentStepIndex = statusSteps.indexOf(
                  order.status
                );

                const groupedItems = Object.values(
                  (order.items || []).reduce((acc, item) => {
                    const key = `${item.productId || item.name}-${item.size || ""}-${item.color || ""}`;
                    if (!acc[key]) {
                      acc[key] = { ...item };
                    } else {
                      acc[key].qty =
                        Number(acc[key].qty || 1) +
                        Number(item.qty || 1);
                    }
                    return acc;
                  }, {})
                );

                return (
                  <article
                    key={order._id}
                    className="overflow-hidden rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] shadow-[0_16px_45px_rgba(91,59,50,0.06)] sm:rounded-3xl"
                  >
                    <div className="grid grid-cols-2 gap-4 bg-[#FDEAE6] px-4 py-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-5">
                      <div>
                        <p className="text-xs text-[#8b746b] uppercase tracking-[0.15em]">
                          Order ID
                        </p>

                        <h2 className="font-bold text-[#9A3F4D] mt-1">
                          {order.orderId}
                        </h2>
                      </div>

                      <div>
                        <p className="text-xs text-[#8b746b] uppercase tracking-[0.15em]">
                          Order Date
                        </p>

                        <p className="font-semibold text-[#5B3B32] mt-1">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#8b746b] uppercase tracking-[0.15em]">
                          Payment
                        </p>

                        <p className="font-semibold text-[#5B3B32] mt-1">
                          {order.paymentMethod}
                        </p>
                      </div>

                      <span
                        className={`col-span-2 w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] sm:col-span-1 ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        {groupedItems.map((item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            className="flex min-w-0 gap-3 border-b border-[#eadbd4] pb-4 last:border-b-0 sm:gap-4 sm:pb-5"
                          >
                            {item.productId ? (
                              <Link to={`/product/${item.productId}`}>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-28 w-20 shrink-0 rounded-2xl bg-[#f7f2ee] object-cover object-top sm:h-32 sm:w-24"
                                />
                              </Link>
                            ) : (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-28 w-20 shrink-0 rounded-2xl bg-[#f7f2ee] object-cover object-top sm:h-32 sm:w-24"
                              />
                            )}

                            <div className="min-w-0 flex-1">
                              {item.productId ? (
                                <Link to={`/product/${item.productId}`}>
                                  <h3 className="heading-font line-clamp-2 break-words text-xl text-[#5B3B32] hover:text-[#9A3F4D] sm:text-2xl">
                                    {item.name}
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="heading-font line-clamp-2 break-words text-xl text-[#5B3B32] sm:text-2xl">
                                  {item.name}
                                </h3>
                              )}

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#8b746b]">
                                <span className="rounded-full bg-[#f7f2ee] px-3 py-1.5">
                                  Qty: {item.qty || 1}
                                </span>
                                {(item.selectedSize || item.size) && (
                                  <span className="rounded-full bg-[#f7f2ee] px-3 py-1.5">
                                    Size: {item.selectedSize || item.size}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 font-bold text-[#9A3F4D]">
                                ₹
                                {Number(
                                  item.price
                                ).toLocaleString("en-IN")}
                              </p>

                              {order.status === "Delivered" &&
                                renderReviewAction(item)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.status !== "Cancelled" && (
                        <div className="mt-7">
                          <div className="relative grid grid-cols-4 gap-1.5 sm:gap-2">
                            <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-[#eadbd4]" />
                            {statusSteps.map((step, index) => (
                              <div
                                key={step}
                                className="relative z-10 text-center"
                              >
                                <div
                                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#fffaf7] font-bold shadow-sm ${
                                    index <= currentStepIndex
                                      ? "bg-[#9A3F4D] text-white"
                                      : "bg-[#FDEAE6] text-[#9A3F4D]"
                                  }`}
                                >
                                  {index < currentStepIndex
                                    ? "✓"
                                    : index + 1}
                                </div>

                                <p className="mt-2 text-[9px] font-semibold leading-4 text-[#5B3B32] sm:text-[10px] md:text-xs">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-5 border-t border-[#eadbd4] pt-5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pt-6">
                        <div>
                          <p className="text-sm text-[#8b746b]">
                            Order Total
                          </p>

                          <p className="text-2xl font-bold text-[#9A3F4D]">
                            ₹
                            {Number(
                              order.amount
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
                          <Link
                            to={`/track-order/${order.orderId}`}
                          >
                            <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5B3B32] px-4 py-3 text-sm font-semibold text-white sm:w-auto sm:px-5">
                              <FiTruck />
                              Track Order
                            </button>
                          </Link>

                            {order.status === "Delivered" && (
  <button
    onClick={() => handleDownloadInvoice(order.orderId)}
    className="min-h-12 w-full rounded-xl bg-[#8C3F31] px-4 py-3 text-sm font-semibold text-white hover:bg-[#713126] sm:w-auto sm:px-5"
  >
    📄 Download Invoice
  </button>
)}



                          <Link to="/products">
                            <button className="min-h-12 w-full rounded-xl border border-[#9A3F4D] px-4 py-3 text-sm font-semibold text-[#9A3F4D] sm:w-auto sm:px-5">
                              Buy Again
                            </button>
                          </Link>

                          {["Pending", "Confirmed"].includes(
                            order.status
                          ) && (
                            <button
                              onClick={() =>
                                handleCancelOrder(order._id)
                              }
                              disabled={
                                cancellingId === order._id
                              }
                              className="min-h-12 w-full rounded-xl border border-red-500 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50 sm:w-auto sm:px-5"
                            >
                              {cancellingId === order._id
                                ? "Cancelling..."
                                : "Cancel Order"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </main>

      <Footer />

      <WriteReviewModal
        open={reviewModalOpen}
        onClose={closeReviewModal}
        productId={selectedReviewProduct?.productId}
        existingReview={
          selectedReviewProduct?.productId
            ? reviewStatusByProduct[
                selectedReviewProduct.productId
              ]?.review || null
            : null
        }
        onSuccess={handleReviewSuccess}
      />
    </>
  );
}

export default MyOrders;