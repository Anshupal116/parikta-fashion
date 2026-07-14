import { useEffect, useMemo, useState } from "react";
import {
  adminDeleteReview,
  getAllReviews,
  replyReview,
  updateReviewStatus,
} from "../../services/reviewService";

function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadReviews = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllReviews();

      if (response.success) {
        setReviews(response.reviews || []);
      } else {
        alert(response.message || "Reviews load failed");
      }
    } catch (error) {
      console.error("Reviews load error:", error);

      alert(
        error.response?.data?.message ||
          "Reviews load failed"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (review, newStatus) => {
    if (review.status === newStatus) return;

    const confirmMessage =
      newStatus === "Approved"
        ? "Approve this review?"
        : newStatus === "Rejected"
          ? "Reject this review?"
          : "Move this review to pending?";

    const ok = window.confirm(confirmMessage);

    if (!ok) return;

    try {
      setUpdatingId(review._id);

      const response = await updateReviewStatus(
        review._id,
        newStatus
      );

      if (response.success) {
        setReviews((currentReviews) =>
          currentReviews.map((item) =>
            item._id === review._id
              ? {
                  ...item,
                  status: newStatus,
                }
              : item
          )
        );
      } else {
        alert(
          response.message || "Review status update failed"
        );
      }
    } catch (error) {
      console.error("Review status error:", error);

      alert(
        error.response?.data?.message ||
          "Review status update failed"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || "");
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    if (replySubmitting) return;

    setReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!selectedReview?._id) return;

    if (!replyText.trim()) {
      alert("Please write a reply");
      return;
    }

    try {
      setReplySubmitting(true);

      const response = await replyReview(
        selectedReview._id,
        replyText.trim()
      );

      if (response.success) {
        setReviews((currentReviews) =>
          currentReviews.map((review) =>
            review._id === selectedReview._id
              ? {
                  ...review,
                  adminReply: replyText.trim(),
                }
              : review
          )
        );

        alert("Reply saved successfully");
        closeReplyModal();
      } else {
        alert(response.message || "Reply save failed");
      }
    } catch (error) {
      console.error("Review reply error:", error);

      alert(
        error.response?.data?.message ||
          "Reply save failed"
      );
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDelete = async (review) => {
    const ok = window.confirm(
      `Are you sure you want to permanently delete the review from ${
        review.customerName ||
        review.customerId?.name ||
        "this customer"
      }?`
    );

    if (!ok) return;

    try {
      setDeletingId(review._id);

      const response = await adminDeleteReview(review._id);

      if (response.success) {
        setReviews((currentReviews) =>
          currentReviews.filter(
            (item) => item._id !== review._id
          )
        );

        alert("Review deleted successfully");
      } else {
        alert(response.message || "Review delete failed");
      }
    } catch (error) {
      console.error("Review delete error:", error);

      alert(
        error.response?.data?.message ||
          "Review delete failed"
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const customerName =
        review.customerName ||
        review.customerId?.name ||
        "";

      const customerPhone =
        review.customerId?.phone || "";

      const customerEmail =
        review.customerId?.email || "";

      const productName =
        review.productId?.name || "";

      const reviewTitle = review.title || "";
      const reviewComment = review.comment || "";

      const matchesSearch =
        !query ||
        customerName.toLowerCase().includes(query) ||
        customerPhone.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query) ||
        reviewTitle.toLowerCase().includes(query) ||
        reviewComment.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  const totalReviews = reviews.length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending"
  ).length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "Rejected"
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const getStatusClass = (status) => {
    const classes = {
      Pending:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
      Approved:
        "bg-green-100 text-green-700 border-green-200",
      Rejected:
        "bg-red-100 text-red-700 border-red-200",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating || 0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= numericRating
                ? "text-[#C9A227]"
                : "text-[#ded4ce]"
            }
          >
            ★
          </span>
        ))}

        <span className="text-xs text-[#8b746b] ml-1">
          {numericRating}/5
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

          <h2 className="text-2xl font-bold text-[#5B3B32] mt-5">
            Loading Reviews...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
            Customer Feedback
          </p>

          <h1 className="heading-font text-4xl text-[#5B3B32] mt-1">
            Reviews
          </h1>

          <p className="text-[#8b746b] mt-2">
            Approve, reject, reply to and manage customer
            reviews.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customer or product..."
            className="w-full md:w-72 border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing}
            className="bg-[#5B3B32] hover:bg-[#9A3F4D] text-white px-5 py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          ["Total Reviews", totalReviews],
          ["Pending", pendingReviews],
          ["Approved", approvedReviews],
          ["Rejected", rejectedReviews],
          ["Average Rating", `${averageRating} ★`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm"
          >
            <h2 className="heading-font text-3xl md:text-4xl text-[#9A3F4D]">
              {value}
            </h2>

            <p className="text-[11px] tracking-[0.16em] uppercase text-[#5B3B32] mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review</th>
                <th className="p-4">Purchase</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reply</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReviews.map((review) => {
                const isUpdating =
                  updatingId === review._id;

                const isDeleting =
                  deletingId === review._id;

                const customerName =
                  review.customerName ||
                  review.customerId?.name ||
                  "Parikta Customer";

                return (
                  <tr
                    key={review._id}
                    className="border-t border-[#eadbd4] text-[#5B3B32] align-top hover:bg-[#fff7f3] transition"
                  >
                    <td className="p-4">
                      <div className="flex gap-3 min-w-[210px]">
                        {review.productId?.image ? (
                          <img
                            src={review.productId.image}
                            alt={
                              review.productId?.name ||
                              "Product"
                            }
                            className="w-14 h-16 object-cover object-top rounded-xl bg-[#f7f2ee]"
                          />
                        ) : (
                          <div className="w-14 h-16 rounded-xl bg-[#FDEAE6] flex items-center justify-center text-xs text-[#9A3F4D]">
                            No image
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-[#5B3B32]">
                            {review.productId?.name ||
                              "Deleted Product"}
                          </p>

                          {review.productId?.price !==
                            undefined && (
                            <p className="text-sm text-[#9A3F4D] font-semibold mt-1">
                              ₹
                              {Number(
                                review.productId.price || 0
                              ).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 min-w-[190px]">
                      <p className="font-semibold">
                        {customerName}
                      </p>

                      <p className="text-xs text-[#8b746b] mt-1">
                        {review.customerId?.phone || "-"}
                      </p>

                      <p className="text-xs text-[#8b746b] mt-1">
                        {review.customerId?.email || "-"}
                      </p>
                    </td>

                    <td className="p-4 min-w-[150px]">
                      {renderStars(review.rating)}
                    </td>

                    <td className="p-4 min-w-[290px] max-w-[340px]">
                      {review.title && (
                        <p className="font-bold text-[#5B3B32]">
                          {review.title}
                        </p>
                      )}

                      <p className="text-sm text-[#6d554d] leading-6 mt-2">
                        {review.comment || "-"}
                      </p>
                    </td>

                    <td className="p-4">
                      {review.verifiedPurchase ? (
                        <span className="inline-flex bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex bg-gray-100 border border-gray-200 text-gray-600 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {review.createdAt
                        ? new Date(
                            review.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="p-4 min-w-[140px]">
                      <span
                        className={`inline-flex px-3 py-2 rounded-full border text-xs font-bold ${getStatusClass(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td className="p-4 min-w-[220px]">
                      {review.adminReply ? (
                        <div>
                          <p className="text-sm text-[#5B3B32] leading-6 line-clamp-3">
                            {review.adminReply}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              openReplyModal(review)
                            }
                            className="text-xs font-bold text-[#9A3F4D] underline mt-2"
                          >
                            Edit Reply
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openReplyModal(review)
                          }
                          className="border border-[#9A3F4D] text-[#9A3F4D] px-4 py-2 rounded-xl text-sm font-semibold"
                        >
                          Add Reply
                        </button>
                      )}
                    </td>

                    <td className="p-4 min-w-[210px]">
                      <div className="flex flex-col gap-2">
                        {review.status !== "Approved" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                review,
                                "Approved"
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Approve"}
                          </button>
                        )}

                        {review.status !== "Rejected" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                review,
                                "Rejected"
                              )
                            }
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        {review.status !== "Pending" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                review,
                                "Pending"
                              )
                            }
                            className="border border-[#BFA996] text-[#5B3B32] px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                          >
                            Move to Pending
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDelete(review)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-16 px-5">
            <h3 className="heading-font text-3xl text-[#5B3B32]">
              No Reviews Found
            </h3>

            <p className="text-[#8b746b] mt-2">
              Search or filter ke according koi review
              available nahi hai.
            </p>
          </div>
        )}
      </div>

      {replyModalOpen && selectedReview && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-xl bg-[#fffaf7] rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eadbd4]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
                Admin Response
              </p>

              <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
                Reply To Review
              </h2>

              <p className="text-sm text-[#8b746b] mt-2">
                Customer:{" "}
                {selectedReview.customerName ||
                  selectedReview.customerId?.name ||
                  "Parikta Customer"}
              </p>
            </div>

            <form
              onSubmit={handleReplySubmit}
              className="p-6"
            >
              <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-4 mb-5">
                <p className="font-bold text-[#5B3B32]">
                  {selectedReview.title ||
                    "Customer Review"}
                </p>

                <p className="text-sm text-[#6d554d] leading-6 mt-2">
                  {selectedReview.comment}
                </p>
              </div>

              <label
                htmlFor="admin-review-reply"
                className="block text-sm font-bold text-[#5B3B32] mb-2"
              >
                Parikta Fashion Reply
              </label>

              <textarea
                id="admin-review-reply"
                value={replyText}
                onChange={(event) =>
                  setReplyText(event.target.value)
                }
                maxLength={1000}
                rows={6}
                placeholder="Thank you for sharing your experience..."
                className="w-full border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none resize-none focus:border-[#9A3F4D]"
              />

              <p className="text-xs text-[#8b746b] text-right mt-1">
                {replyText.length}/1000
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeReplyModal}
                  disabled={replySubmitting}
                  className="border border-[#9A3F4D] text-[#9A3F4D] px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="bg-[#9A3F4D] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {replySubmitting
                    ? "Saving..."
                    : "Save Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsAdmin;