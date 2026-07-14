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

        <main className="min-h-screen bg-[#f7f2ee] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

            <h1 className="heading-font text-4xl text-[#5B3B32] mt-5">
              Loading Orders...
            </h1>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-10 md:py-14">
        <Container>
          <div className="mb-9">
            <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
              Customer Account
            </p>

            <h1 className="heading-font text-5xl md:text-6xl text-[#5B3B32] mt-2">
              My Orders
            </h1>

            <p className="text-[#8b746b] mt-3">
              View, track and manage all your Parikta orders.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
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
                  className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="heading-font text-4xl text-[#9A3F4D]">
                        {stat.value}
                      </h2>

                      <p className="text-xs tracking-[0.16em] uppercase text-[#5B3B32] mt-2">
                        {stat.label}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-[#FDEAE6] text-[#9A3F4D] flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#FDEAE6] text-[#9A3F4D] flex items-center justify-center mx-auto">
                <FiBox size={34} />
              </div>

              <h2 className="heading-font text-4xl text-[#5B3B32] mt-6">
                No Orders Yet
              </h2>

              <p className="text-[#8b746b] mt-3">
                Your placed orders will appear here.
              </p>

              <Link to="/products">
                <button className="mt-7 bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStepIndex = statusSteps.indexOf(
                  order.status
                );

                return (
                  <article
                    key={order._id}
                    className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden"
                  >
                    <div className="bg-[#FDEAE6] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
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
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.12em] ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            className="flex flex-col sm:flex-row gap-4 border-b border-[#eadbd4] pb-5 last:border-b-0"
                          >
                            {item.productId ? (
                              <Link to={`/product/${item.productId}`}>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-24 h-32 object-cover object-top rounded-2xl bg-[#f7f2ee]"
                                />
                              </Link>
                            ) : (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-24 h-32 object-cover object-top rounded-2xl bg-[#f7f2ee]"
                              />
                            )}

                            <div className="flex-1">
                              {item.productId ? (
                                <Link to={`/product/${item.productId}`}>
                                  <h3 className="heading-font text-2xl text-[#5B3B32] hover:text-[#9A3F4D]">
                                    {item.name}
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="heading-font text-2xl text-[#5B3B32]">
                                  {item.name}
                                </h3>
                              )}

                              <p className="text-[#8b746b] text-sm mt-2">
                                Quantity: {item.qty || 1}
                              </p>

                              <p className="text-[#9A3F4D] font-bold mt-2">
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
                          <div className="grid grid-cols-4 gap-2">
                            {statusSteps.map((step, index) => (
                              <div
                                key={step}
                                className="text-center"
                              >
                                <div
                                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold ${
                                    index <= currentStepIndex
                                      ? "bg-[#9A3F4D] text-white"
                                      : "bg-[#FDEAE6] text-[#9A3F4D]"
                                  }`}
                                >
                                  {index < currentStepIndex
                                    ? "✓"
                                    : index + 1}
                                </div>

                                <p className="text-[10px] md:text-xs text-[#5B3B32] font-semibold mt-2">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-[#eadbd4] mt-7 pt-6 flex flex-wrap items-center justify-between gap-5">
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

                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/track-order/${order.orderId}`}
                          >
                            <button className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2">
                              <FiTruck />
                              Track Order
                            </button>
                          </Link>

                          <Link to="/products">
                            <button className="border border-[#9A3F4D] text-[#9A3F4D] px-5 py-3 rounded-xl font-semibold">
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
                              className="border border-red-500 text-red-600 px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
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