import { useEffect, useMemo, useState } from "react";
import {
  FiBarChart2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiFilter,
  FiImage,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  adminDeleteReview,
  getAllReviews,
  replyReview,
  updateReviewStatus,
} from "../../services/reviewService";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];
const RATING_OPTIONS = ["All", "5", "4", "3", "2", "1"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const getMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const normalizeReviewsResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.reviews)) return response.reviews;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.reviews)) {
    return response.data.reviews;
  }
  return [];
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(
    "en-IN",
    includeTime
      ? {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
  );
};

const getCustomerName = (review) =>
  review?.customerName ||
  review?.customerId?.name ||
  "Parikta Customer";

const getCustomerPhone = (review) =>
  review?.customerId?.phone ||
  review?.customerPhone ||
  "-";

const getCustomerEmail = (review) =>
  review?.customerId?.email ||
  review?.customerEmail ||
  "-";

const getProductName = (review) =>
  review?.productId?.name ||
  review?.productName ||
  "Deleted Product";

const getProductImage = (review) =>
  review?.productId?.image ||
  review?.productImage ||
  "";

const getReviewImages = (review) => {
  if (Array.isArray(review?.images)) return review.images;
  if (Array.isArray(review?.reviewImages)) {
    return review.reviewImages;
  }
  return [];
};

const getStatusClass = (status) => {
  const map = {
    Pending:
      "bg-amber-50 text-amber-700 border-amber-200",
    Approved:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected:
      "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    map[status] ||
    "bg-slate-50 text-slate-700 border-slate-200"
  );
};

function Stars({ rating, size = "text-base" }) {
  const numericRating = Number(rating || 0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} ${
            star <= numericRating
              ? "text-[#C9A227]"
              : "text-[#ded4ce]"
          }`}
        >
          ★
        </span>
      ))}

      <span className="ml-1 text-xs text-[#8b746b]">
        {numericRating}/5
      </span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
}) {
  return (
    <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b746b]">
            {label}
          </p>

          <h2 className="heading-font mt-3 text-3xl text-[#5B3B32] md:text-4xl">
            {value}
          </h2>

          {helper && (
            <p className="mt-2 text-xs text-[#8b746b]">
              {helper}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDEAE6] text-[#9A3F4D]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [ratingFilter, setRatingFilter] =
    useState("All");
  const [productFilter, setProductFilter] =
    useState("All");
  const [verifiedFilter, setVerifiedFilter] =
    useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [updatingId, setUpdatingId] =
    useState("");
  const [deletingId, setDeletingId] =
    useState("");

  const [selectedReview, setSelectedReview] =
    useState(null);
  const [replyReviewItem, setReplyReviewItem] =
    useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] =
    useState(false);

  const [selectedIds, setSelectedIds] =
    useState([]);
  const [bulkUpdating, setBulkUpdating] =
    useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState(10);

  const loadReviews = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAllReviews();
      const normalized =
        normalizeReviewsResponse(response);

      if (
        response?.success === false &&
        normalized.length === 0
      ) {
        throw new Error(
          response?.message || "Reviews load failed"
        );
      }

      setReviews(normalized);
      setSelectedIds([]);
    } catch (loadError) {
      console.error("Reviews load error:", loadError);
      setReviews([]);
      setError(
        getMessage(
          loadError,
          "Reviews load nahi hue. Backend connection check karein."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const productNames = useMemo(
    () =>
      [
        ...new Set(
          reviews
            .map((review) =>
              getProductName(review)
            )
            .filter(Boolean)
        ),
      ].sort(),
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const createdAt = review?.createdAt
        ? new Date(review.createdAt)
        : null;

      const matchesSearch =
        !query ||
        [
          getCustomerName(review),
          getCustomerPhone(review),
          getCustomerEmail(review),
          getProductName(review),
          review?.title,
          review?.comment,
          review?.adminReply,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

      const matchesStatus =
        statusFilter === "All" ||
        review?.status === statusFilter;

      const matchesRating =
        ratingFilter === "All" ||
        Number(review?.rating || 0) ===
          Number(ratingFilter);

      const matchesProduct =
        productFilter === "All" ||
        getProductName(review) === productFilter;

      const matchesVerified =
        verifiedFilter === "All" ||
        (verifiedFilter === "Verified"
          ? review?.verifiedPurchase === true
          : review?.verifiedPurchase !== true);

      let matchesFrom = true;
      let matchesTo = true;

      if (fromDate && createdAt) {
        matchesFrom =
          createdAt >=
          new Date(`${fromDate}T00:00:00`);
      }

      if (toDate && createdAt) {
        matchesTo =
          createdAt <=
          new Date(`${toDate}T23:59:59`);
      }

      if ((fromDate || toDate) && !createdAt) {
        return false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRating &&
        matchesProduct &&
        matchesVerified &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    reviews,
    search,
    statusFilter,
    ratingFilter,
    productFilter,
    verifiedFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [
    search,
    statusFilter,
    ratingFilter,
    productFilter,
    verifiedFilter,
    fromDate,
    toDate,
    pageSize,
  ]);

  const metrics = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter(
      (review) => review.status === "Approved"
    ).length;
    const pending = reviews.filter(
      (review) => review.status === "Pending"
    ).length;
    const rejected = reviews.filter(
      (review) => review.status === "Rejected"
    ).length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / total
        : 0;

    const photoReviews = reviews.filter(
      (review) =>
        getReviewImages(review).length > 0
    ).length;

    return {
      total,
      approved,
      pending,
      rejected,
      average: average.toFixed(1),
      photoReviews,
    };
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter(
        (review) =>
          Number(review.rating || 0) === rating
      ).length;

      const percentage = reviews.length
        ? Math.round(
            (count / reviews.length) * 100
          )
        : 0;

      return {
        rating,
        count,
        percentage,
      };
    });
  }, [reviews]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReviews.length / pageSize
    )
  );

  const paginatedReviews = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return filteredReviews.slice(
      start,
      start + pageSize
    );
  }, [
    filteredReviews,
    page,
    pageSize,
    totalPages,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusChange = async (
    review,
    newStatus
  ) => {
    if (
      !review?._id ||
      review.status === newStatus
    ) {
      return;
    }

    const ok = window.confirm(
      `Review status ${newStatus} karna hai?`
    );

    if (!ok) return;

    try {
      setUpdatingId(review._id);

      const response = await updateReviewStatus(
        review._id,
        newStatus
      );

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Review status update failed"
        );
      }

      setReviews((current) =>
        current.map((item) =>
          item._id === review._id
            ? {
                ...item,
                status:
                  response?.review?.status ||
                  newStatus,
              }
            : item
        )
      );

      setSelectedReview((current) =>
        current?._id === review._id
          ? { ...current, status: newStatus }
          : current
      );
    } catch (statusError) {
      console.error(statusError);
      window.alert(
        getMessage(
          statusError,
          "Review status update failed"
        )
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (review) => {
    const ok = window.confirm(
      `Review from ${getCustomerName(
        review
      )} permanently delete karna hai?`
    );

    if (!ok) return;

    try {
      setDeletingId(review._id);

      const response = await adminDeleteReview(
        review._id
      );

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Review delete failed"
        );
      }

      setReviews((current) =>
        current.filter(
          (item) => item._id !== review._id
        )
      );

      setSelectedIds((current) =>
        current.filter(
          (id) => id !== review._id
        )
      );

      if (selectedReview?._id === review._id) {
        setSelectedReview(null);
      }
    } catch (deleteError) {
      console.error(deleteError);
      window.alert(
        getMessage(
          deleteError,
          "Review delete failed"
        )
      );
    } finally {
      setDeletingId("");
    }
  };

  const openReplyModal = (review) => {
    setReplyReviewItem(review);
    setReplyText(review?.adminReply || "");
  };

  const closeReplyModal = () => {
    if (replySubmitting) return;

    setReplyReviewItem(null);
    setReplyText("");
  };

  const handleReplySubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!replyReviewItem?._id) return;

    if (!replyText.trim()) {
      window.alert("Please write a reply");
      return;
    }

    try {
      setReplySubmitting(true);

      const response = await replyReview(
        replyReviewItem._id,
        replyText.trim()
      );

      if (response?.success === false) {
        throw new Error(
          response?.message || "Reply save failed"
        );
      }

      setReviews((current) =>
        current.map((review) =>
          review._id === replyReviewItem._id
            ? {
                ...review,
                adminReply: replyText.trim(),
                replyUpdatedAt:
                  new Date().toISOString(),
              }
            : review
        )
      );

      setSelectedReview((current) =>
        current?._id === replyReviewItem._id
          ? {
              ...current,
              adminReply: replyText.trim(),
              replyUpdatedAt:
                new Date().toISOString(),
            }
          : current
      );

      closeReplyModal();
    } catch (replyError) {
      console.error(replyError);
      window.alert(
        getMessage(
          replyError,
          "Reply save failed"
        )
      );
    } finally {
      setReplySubmitting(false);
    }
  };

  const toggleReviewSelection = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const togglePageSelection = () => {
    const pageIds = paginatedReviews
      .map((review) => review._id)
      .filter(Boolean);

    const allSelected = pageIds.every((id) =>
      selectedIds.includes(id)
    );

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !pageIds.includes(id)
        )
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([...current, ...pageIds]),
      ]);
    }
  };

  const handleBulkStatus = async (
    newStatus
  ) => {
    if (!selectedIds.length) return;

    const ok = window.confirm(
      `${selectedIds.length} reviews ko ${newStatus} karna hai?`
    );

    if (!ok) return;

    try {
      setBulkUpdating(true);

      const selectedReviews = reviews.filter(
        (review) =>
          selectedIds.includes(review._id)
      );

      const results = await Promise.allSettled(
        selectedReviews.map((review) =>
          updateReviewStatus(
            review._id,
            newStatus
          )
        )
      );

      const successfulIds = results
        .map((result, index) => ({
          result,
          id: selectedReviews[index]._id,
        }))
        .filter(
          ({ result }) =>
            result.status === "fulfilled" &&
            result.value?.success !== false
        )
        .map(({ id }) => id);

      setReviews((current) =>
        current.map((review) =>
          successfulIds.includes(review._id)
            ? { ...review, status: newStatus }
            : review
        )
      );

      setSelectedIds([]);
    } catch (bulkError) {
      console.error(bulkError);
      window.alert("Bulk update failed");
    } finally {
      setBulkUpdating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setRatingFilter("All");
    setProductFilter("All");
    setVerifiedFilter("All");
    setFromDate("");
    setToDate("");
  };

  const exportCsv = () => {
    if (!filteredReviews.length) {
      window.alert(
        "Export ke liye reviews nahi hain"
      );
      return;
    }

    const rows = filteredReviews.map(
      (review) => ({
        Customer: getCustomerName(review),
        Phone: getCustomerPhone(review),
        Email: getCustomerEmail(review),
        Product: getProductName(review),
        Rating: Number(review.rating || 0),
        Title: review.title || "",
        Review: review.comment || "",
        Status: review.status || "",
        "Verified Purchase":
          review.verifiedPurchase
            ? "Yes"
            : "No",
        "Admin Reply":
          review.adminReply || "",
        Date: review.createdAt
          ? new Date(
              review.createdAt
            ).toISOString()
          : "",
      })
    );

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(
              row[header] ?? ""
            ).replace(/"/g, '""');

            return `"${value}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `parikta-reviews-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

          <h2 className="mt-5 text-2xl font-bold text-[#5B3B32]">
            Loading Reviews...
          </h2>

          <p className="mt-2 text-sm text-[#8b746b]">
            Customer feedback fetch ho raha hai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#BFA996]">
            Customer Feedback
          </p>

          <h1 className="heading-font mt-1 text-4xl text-[#5B3B32]">
            Reviews
          </h1>

          <p className="mt-2 text-[#8b746b]">
            Moderate reviews, reply to customers and analyse ratings.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-2xl border border-[#9A3F4D] bg-white px-4 py-3 text-sm font-semibold text-[#9A3F4D]"
          >
            <FiDownload />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              loadReviews({ silent: true })
            }
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl bg-[#9A3F4D] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <h3 className="font-bold text-rose-700">
            Reviews load nahi hue
          </h3>

          <p className="mt-1 text-sm text-rose-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadReviews()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-6">
        <StatCard
          icon={<FiMessageSquare />}
          label="Total Reviews"
          value={metrics.total}
          helper={`${filteredReviews.length} visible`}
        />

        <StatCard
          icon={<FiCheck />}
          label="Approved"
          value={metrics.approved}
        />

        <StatCard
          icon={<FiRefreshCw />}
          label="Pending"
          value={metrics.pending}
        />

        <StatCard
          icon={<FiX />}
          label="Rejected"
          value={metrics.rejected}
        />

        <StatCard
          icon={<FiStar />}
          label="Average Rating"
          value={`${metrics.average} ★`}
        />

        <StatCard
          icon={<FiImage />}
          label="Photo Reviews"
          value={metrics.photoReviews}
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#5B3B32]">
            <FiFilter />
            <h2 className="font-bold">
              Search & Filters
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="relative md:col-span-2 xl:col-span-3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A3F4D]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Customer, product, review, reply..."
                className="w-full rounded-2xl border border-[#eadbd4] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#9A3F4D]"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm"
            >
              <option value="All">
                All Statuses
              </option>
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(event.target.value)
              }
              className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm"
            >
              {RATING_OPTIONS.map((rating) => (
                <option
                  key={rating}
                  value={rating}
                >
                  {rating === "All"
                    ? "All Ratings"
                    : `${rating} Star`}
                </option>
              ))}
            </select>

            <select
              value={productFilter}
              onChange={(event) =>
                setProductFilter(event.target.value)
              }
              className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm"
            >
              <option value="All">
                All Products
              </option>
              {productNames.map((product) => (
                <option
                  key={product}
                  value={product}
                >
                  {product}
                </option>
              ))}
            </select>

            <select
              value={verifiedFilter}
              onChange={(event) =>
                setVerifiedFilter(
                  event.target.value
                )
              }
              className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm"
            >
              <option value="All">
                All Purchases
              </option>
              <option value="Verified">
                Verified Purchase
              </option>
              <option value="Unverified">
                Unverified
              </option>
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(event.target.value)
              }
              className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm"
              title="From date"
            />

            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) =>
                setToDate(event.target.value)
              }
              className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm"
              title="To date"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <p className="text-[#8b746b]">
              Showing{" "}
              <strong className="text-[#5B3B32]">
                {filteredReviews.length}
              </strong>{" "}
              of{" "}
              <strong className="text-[#5B3B32]">
                {reviews.length}
              </strong>
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#9A3F4D]"
            >
              Clear filters
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-[#5B3B32]">
            <FiBarChart2 />
            <h2 className="font-bold">
              Rating Distribution
            </h2>
          </div>

          <div className="space-y-4">
            {ratingDistribution.map((item) => (
              <div
                key={item.rating}
                className="grid grid-cols-[54px_1fr_42px] items-center gap-3"
              >
                <span className="text-sm font-semibold text-[#5B3B32]">
                  {item.rating} ★
                </span>

                <div className="h-2.5 overflow-hidden rounded-full bg-[#eee4df]">
                  <div
                    className="h-full rounded-full bg-[#9A3F4D]"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="text-right text-xs text-[#8b746b]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#eadbd4] bg-[#FDEAE6] p-4 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-[#5B3B32]">
            {selectedIds.length} reviews selected
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkUpdating}
              onClick={() =>
                handleBulkStatus("Approved")
              }
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Bulk Approve
            </button>

            <button
              type="button"
              disabled={bulkUpdating}
              onClick={() =>
                handleBulkStatus("Rejected")
              }
              className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Bulk Reject
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-xl border border-[#9A3F4D] bg-white px-4 py-2.5 text-sm font-semibold text-[#9A3F4D]"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={
                      paginatedReviews.length > 0 &&
                      paginatedReviews.every(
                        (review) =>
                          selectedIds.includes(
                            review._id
                          )
                      )
                    }
                    onChange={togglePageSelection}
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review</th>
                <th className="p-4">Media</th>
                <th className="p-4">Purchase</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reply</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedReviews.map((review) => {
                const images =
                  getReviewImages(review);
                const isUpdating =
                  updatingId === review._id;
                const isDeleting =
                  deletingId === review._id;

                return (
                  <tr
                    key={review._id}
                    className="border-t border-[#eadbd4] align-top text-[#5B3B32] hover:bg-[#fff7f3]"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          review._id
                        )}
                        onChange={() =>
                          toggleReviewSelection(
                            review._id
                          )
                        }
                      />
                    </td>

                    <td className="p-4">
                      <div className="flex min-w-[220px] gap-3">
                        {getProductImage(review) ? (
                          <img
                            src={getProductImage(review)}
                            alt={getProductName(review)}
                            className="h-16 w-14 rounded-xl object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-16 w-14 items-center justify-center rounded-xl bg-[#FDEAE6] text-xs text-[#9A3F4D]">
                            No image
                          </div>
                        )}

                        <div>
                          <p className="font-bold">
                            {getProductName(review)}
                          </p>

                          {review?.productId?.price !==
                            undefined && (
                            <p className="mt-1 text-sm font-semibold text-[#9A3F4D]">
                              ₹
                              {Number(
                                review.productId.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="min-w-[190px] p-4">
                      <p className="font-semibold">
                        {getCustomerName(review)}
                      </p>
                      <p className="mt-1 text-xs text-[#8b746b]">
                        {getCustomerPhone(review)}
                      </p>
                      <p className="mt-1 text-xs text-[#8b746b]">
                        {getCustomerEmail(review)}
                      </p>
                    </td>

                    <td className="min-w-[150px] p-4">
                      <Stars rating={review.rating} />
                    </td>

                    <td className="min-w-[290px] max-w-[350px] p-4">
                      {review.title && (
                        <p className="font-bold">
                          {review.title}
                        </p>
                      )}

                      <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#6d554d]">
                        {review.comment || "-"}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReview(review)
                        }
                        className="mt-2 text-xs font-bold text-[#9A3F4D] underline"
                      >
                        View Details
                      </button>
                    </td>

                    <td className="p-4">
                      {images.length ? (
                        <div className="flex gap-2">
                          {images
                            .slice(0, 3)
                            .map((image, index) => (
                              <img
                                key={`${image}-${index}`}
                                src={image}
                                alt="Review"
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                            ))}

                          {images.length > 3 && (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FDEAE6] text-xs font-bold text-[#9A3F4D]">
                              +{images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#8b746b]">
                          No media
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {review.verifiedPurchase ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      {formatDate(review.createdAt)}
                    </td>

                    <td className="min-w-[165px] p-4">
                      <select
                        value={
                          review.status || "Pending"
                        }
                        disabled={isUpdating}
                        onChange={(event) =>
                          handleStatusChange(
                            review,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-[#eadbd4] bg-white px-3 py-2.5 text-sm disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td className="min-w-[220px] p-4">
                      {review.adminReply ? (
                        <div>
                          <p className="line-clamp-3 text-sm leading-6">
                            {review.adminReply}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              openReplyModal(review)
                            }
                            className="mt-2 text-xs font-bold text-[#9A3F4D] underline"
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
                          className="rounded-xl border border-[#9A3F4D] px-4 py-2 text-sm font-semibold text-[#9A3F4D]"
                        >
                          Add Reply
                        </button>
                      )}
                    </td>

                    <td className="min-w-[180px] p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReview(review)
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#5B3B32] px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <FiEye />
                          View
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDelete(review)
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <FiTrash2 />
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

        {!filteredReviews.length && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]">
              <FiMessageSquare size={28} />
            </div>

            <h3 className="mt-5 text-2xl font-semibold text-[#5B3B32]">
              No Reviews Found
            </h3>

            <p className="mt-2 text-[#8b746b]">
              Search ya filters change karke dobara check karein.
            </p>
          </div>
        )}

        {filteredReviews.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-[#eadbd4] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8b746b]">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(
                    Number(event.target.value)
                  )
                }
                className="rounded-xl border border-[#eadbd4] bg-white px-3 py-2 text-sm"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-[#8b746b]">
                Page{" "}
                <strong>{page}</strong> of{" "}
                <strong>{totalPages}</strong>
              </p>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={page <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbd4] bg-white disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                disabled={page >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbd4] bg-white disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[#fffaf7] shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#eadbd4] px-6 py-6 md:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                  Review Details
                </p>

                <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                  {getProductName(selectedReview)}
                </h2>

                <p className="mt-2 text-sm text-[#8b746b]">
                  {formatDate(
                    selectedReview.createdAt,
                    true
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(null)
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4]"
              >
                <FiX />
              </button>
            </header>

            <div className="space-y-6 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Customer
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-[#6d554d]">
                    <p>
                      <strong>Name:</strong>{" "}
                      {getCustomerName(
                        selectedReview
                      )}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {getCustomerPhone(
                        selectedReview
                      )}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {getCustomerEmail(
                        selectedReview
                      )}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Rating & Status
                  </h3>

                  <div className="mt-4 space-y-4">
                    <Stars
                      rating={selectedReview.rating}
                      size="text-xl"
                    />

                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                        selectedReview.status
                      )}`}
                    >
                      {selectedReview.status}
                    </span>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                <h3 className="font-bold text-[#5B3B32]">
                  Customer Review
                </h3>

                {selectedReview.title && (
                  <p className="mt-4 font-bold text-[#5B3B32]">
                    {selectedReview.title}
                  </p>
                )}

                <p className="mt-2 text-sm leading-7 text-[#6d554d]">
                  {selectedReview.comment || "-"}
                </p>
              </section>

              {getReviewImages(selectedReview)
                .length > 0 && (
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Review Photos
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {getReviewImages(
                      selectedReview
                    ).map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="h-44 w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-[#5B3B32]">
                    Admin Reply
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      openReplyModal(
                        selectedReview
                      )
                    }
                    className="text-sm font-bold text-[#9A3F4D]"
                  >
                    {selectedReview.adminReply
                      ? "Edit Reply"
                      : "Add Reply"}
                  </button>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#6d554d]">
                  {selectedReview.adminReply ||
                    "No reply added yet."}
                </p>

                {selectedReview.replyUpdatedAt && (
                  <p className="mt-2 text-xs text-[#8b746b]">
                    Last updated:{" "}
                    {formatDate(
                      selectedReview.replyUpdatedAt,
                      true
                    )}
                  </p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {replyReviewItem && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-[#fffaf7] shadow-2xl">
            <div className="border-b border-[#eadbd4] px-6 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
                Admin Response
              </p>

              <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                Reply To Review
              </h2>

              <p className="mt-2 text-sm text-[#8b746b]">
                Customer:{" "}
                {getCustomerName(replyReviewItem)}
              </p>
            </div>

            <form
              onSubmit={handleReplySubmit}
              className="p-6"
            >
              <div className="mb-5 rounded-2xl border border-[#eadbd4] bg-[#FDEAE6] p-4">
                <p className="font-bold text-[#5B3B32]">
                  {replyReviewItem.title ||
                    "Customer Review"}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6d554d]">
                  {replyReviewItem.comment}
                </p>
              </div>

              <label className="mb-2 block text-sm font-bold text-[#5B3B32]">
                Parikta Fashion Reply
              </label>

              <textarea
                value={replyText}
                onChange={(event) =>
                  setReplyText(event.target.value)
                }
                maxLength={1000}
                rows={6}
                placeholder="Thank you for sharing your experience..."
                className="w-full resize-none rounded-xl border border-[#eadbd4] bg-white px-4 py-3 outline-none focus:border-[#9A3F4D]"
              />

              <p className="mt-1 text-right text-xs text-[#8b746b]">
                {replyText.length}/1000
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReplyModal}
                  disabled={replySubmitting}
                  className="rounded-xl border border-[#9A3F4D] px-6 py-3 font-semibold text-[#9A3F4D] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="rounded-xl bg-[#9A3F4D] px-6 py-3 font-semibold text-white disabled:opacity-50"
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