import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiFilter,
  FiMapPin,
  FiPackage,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from "../../services/orderService";

import { generateInvoicePDF } from "../../utils/invoiceGenerator";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_OPTIONS = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const getApiMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const normalizeOrdersResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.orders)) {
    return response.data.orders;
  }

  return [];
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

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

const getOrderAmount = (order) =>
  Number(
    order?.amount ??
      order?.grandTotal ??
      order?.totalAmount ??
      order?.total ??
      0
  );

const getCustomerName = (order) =>
  order?.customer?.name ||
  order?.customerName ||
  order?.shippingAddress?.name ||
  order?.address?.name ||
  "Guest Customer";

const getCustomerPhone = (order) =>
  order?.customer?.phone ||
  order?.customerPhone ||
  order?.shippingAddress?.phone ||
  order?.address?.phone ||
  "-";

const getCustomerEmail = (order) =>
  order?.customer?.email ||
  order?.customerEmail ||
  order?.shippingAddress?.email ||
  order?.address?.email ||
  "-";

const getOrderStatus = (order) =>
  order?.status || "Pending";

const getPaymentStatus = (order) =>
  order?.paymentStatus ||
  (String(order?.paymentMethod || "")
    .toLowerCase()
    .includes("cod")
    ? "Pending"
    : "Paid");

const getAddressText = (order) => {
  const address =
    order?.address ||
    order?.shippingAddress ||
    order?.deliveryAddress ||
    {};

  return [
    address.house,
    address.addressLine1,
    address.addressLine2,
    address.locality,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const getStatusClass = (status) => {
  const classes = {
    Pending:
      "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed:
      "bg-sky-50 text-sky-700 border-sky-200",
    Shipped:
      "bg-violet-50 text-violet-700 border-violet-200",
    Delivered:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled:
      "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    classes[status] ||
    "bg-slate-50 text-slate-700 border-slate-200"
  );
};

const getPaymentClass = (status) => {
  const classes = {
    Paid:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending:
      "bg-amber-50 text-amber-700 border-amber-200",
    Failed:
      "bg-rose-50 text-rose-700 border-rose-200",
    Refunded:
      "bg-sky-50 text-sky-700 border-sky-200",
  };

  return (
    classes[status] ||
    "bg-slate-50 text-slate-700 border-slate-200"
  );
};

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

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getOrders();
      const normalizedOrders =
        normalizeOrdersResponse(response);

      if (
        response?.success === false &&
        normalizedOrders.length === 0
      ) {
        throw new Error(
          response?.message || "Orders load failed"
        );
      }

      setOrders(normalizedOrders);
    } catch (loadError) {
      console.error("Orders load error:", loadError);
      setOrders([]);
      setError(
        getApiMessage(
          loadError,
          "Orders load nahi hue. Backend connection check karein."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const orderDate = order?.createdAt
        ? new Date(order.createdAt)
        : null;

      const matchesSearch =
        !normalizedSearch ||
        String(order?.orderId || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        getCustomerName(order)
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(getCustomerPhone(order))
          .toLowerCase()
          .includes(normalizedSearch) ||
        getCustomerEmail(order)
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        getOrderStatus(order) === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        getPaymentStatus(order) === paymentFilter;

      let matchesFromDate = true;
      let matchesToDate = true;

      if (fromDate && orderDate) {
        const start = new Date(`${fromDate}T00:00:00`);
        matchesFromDate = orderDate >= start;
      }

      if (toDate && orderDate) {
        const end = new Date(`${toDate}T23:59:59`);
        matchesToDate = orderDate <= end;
      }

      if ((fromDate || toDate) && !orderDate) {
        return false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    paymentFilter,
    fromDate,
    toDate,
    pageSize,
  ]);

  const metrics = useMemo(() => {
    const now = new Date();

    const todayKey = now.toISOString().slice(0, 10);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const nonCancelled = orders.filter(
      (order) => getOrderStatus(order) !== "Cancelled"
    );

    const totalRevenue = nonCancelled.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    const todayOrders = orders.filter((order) => {
      if (!order?.createdAt) return false;

      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) return false;

      return date.toISOString().slice(0, 10) === todayKey;
    });

    const monthOrders = orders.filter((order) => {
      if (!order?.createdAt) return false;

      const date = new Date(order.createdAt);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const monthRevenue = monthOrders
      .filter(
        (order) =>
          getOrderStatus(order) !== "Cancelled"
      )
      .reduce(
        (sum, order) => sum + getOrderAmount(order),
        0
      );

    return {
      totalRevenue,
      todayOrders: todayOrders.length,
      monthRevenue,
      pendingOrders: orders.filter(
        (order) =>
          getOrderStatus(order) === "Pending"
      ).length,
      deliveredOrders: orders.filter(
        (order) =>
          getOrderStatus(order) === "Delivered"
      ).length,
      cancelledOrders: orders.filter(
        (order) =>
          getOrderStatus(order) === "Cancelled"
      ).length,
    };
  }, [orders]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );

  const paginatedOrders = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;

    return filteredOrders.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [
    filteredOrders,
    page,
    pageSize,
    totalPages,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleStatusChange = async (
    order,
    newStatus
  ) => {
    const id = order?._id;
    const currentStatus = getOrderStatus(order);

    if (!id || currentStatus === newStatus) return;

    if (
      ["Cancelled", "Delivered"].includes(
        currentStatus
      )
    ) {
      window.alert(
        `${currentStatus} order ka status change nahi ho sakta`
      );
      return;
    }

    const confirmed = window.confirm(
      `Order status ${currentStatus} se ${newStatus} karna hai?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);

      const response = await updateOrderStatus(
        id,
        newStatus
      );

      if (response?.success === false) {
        throw new Error(
          response?.message || "Status update failed"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === id
            ? {
                ...currentOrder,
                status:
                  response?.order?.status ||
                  newStatus,
              }
            : currentOrder
        )
      );

      setSelectedOrder((current) =>
        current?._id === id
          ? {
              ...current,
              status:
                response?.order?.status ||
                newStatus,
            }
          : current
      );
    } catch (statusError) {
      console.error(
        "Status update error:",
        statusError
      );

      window.alert(
        getApiMessage(
          statusError,
          "Order status update failed"
        )
      );

      await loadOrders({ silent: true });
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (order) => {
    const id = order?._id;

    if (!id) return;

    const confirmed = window.confirm(
      `Order ${
        order?.orderId || ""
      } permanently delete karna hai?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await deleteOrder(id);

      if (response?.success === false) {
        throw new Error(
          response?.message || "Order delete failed"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.filter(
          (currentOrder) =>
            currentOrder._id !== id
        )
      );

      if (selectedOrder?._id === id) {
        setSelectedOrder(null);
      }
    } catch (deleteError) {
      console.error(
        "Order delete error:",
        deleteError
      );

      window.alert(
        getApiMessage(
          deleteError,
          "Order delete failed"
        )
      );
    } finally {
      setDeletingId("");
    }
  };

  const downloadInvoice = async () => {
    if (!selectedOrder) return;

    try {
      await generateInvoicePDF(selectedOrder);
    } catch (invoiceError) {
      console.error(
        "Invoice download error:",
        invoiceError
      );

      window.alert("Invoice download failed");
    }
  };

  const exportCsv = () => {
    if (!filteredOrders.length) {
      window.alert("Export ke liye orders nahi hain");
      return;
    }

    const rows = filteredOrders.map((order) => ({
      "Order ID": order?.orderId || "",
      Customer: getCustomerName(order),
      Phone: getCustomerPhone(order),
      Email: getCustomerEmail(order),
      Items: Array.isArray(order?.items)
        ? order.items
            .map(
              (item) =>
                `${item?.name || "Item"} x ${
                  item?.qty || item?.quantity || 1
                }`
            )
            .join(" | ")
        : "",
      Amount: getOrderAmount(order),
      "Payment Method":
        order?.paymentMethod || "",
      "Payment Status": getPaymentStatus(order),
      Status: getOrderStatus(order),
      Date: order?.createdAt
        ? new Date(order.createdAt).toISOString()
        : "",
      Address: getAddressText(order),
    }));

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
    link.download = `parikta-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

          <h2 className="mt-5 text-2xl font-bold text-[#5B3B32]">
            Loading Orders...
          </h2>

          <p className="mt-2 text-sm text-[#8b746b]">
            Live order data fetch ho raha hai.
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
            Admin Management
          </p>

          <h1 className="heading-font mt-1 text-4xl text-[#5B3B32]">
            Orders
          </h1>

          <p className="mt-2 text-[#8b746b]">
            Manage, search, filter and track customer
            orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-2xl border border-[#9A3F4D] bg-white px-4 py-3 text-sm font-semibold text-[#9A3F4D] transition hover:bg-[#fff5f1]"
          >
            <FiDownload />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              loadOrders({ silent: true })
            }
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl bg-[#9A3F4D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#813541] disabled:cursor-not-allowed disabled:opacity-60"
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
            Orders load nahi hue
          </h3>

          <p className="mt-1 text-sm text-rose-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadOrders()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-6">
        <StatCard
          icon={<FiShoppingBag />}
          label="Total Orders"
          value={orders.length}
          helper={`${filteredOrders.length} visible`}
        />

        <StatCard
          icon={<FiCalendar />}
          label="Today Orders"
          value={metrics.todayOrders}
        />

        <StatCard
          icon={<FiPackage />}
          label="Pending"
          value={metrics.pendingOrders}
        />

        <StatCard
          icon={<FiShoppingBag />}
          label="Delivered"
          value={metrics.deliveredOrders}
        />

        <StatCard
          icon={<FiX />}
          label="Cancelled"
          value={metrics.cancelledOrders}
        />

        <StatCard
          icon={<FiDownload />}
          label="Month Revenue"
          value={formatCurrency(
            metrics.monthRevenue
          )}
          helper={`Total ${formatCurrency(
            metrics.totalRevenue
          )}`}
        />
      </div>

      <section className="mb-6 rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#5B3B32]">
          <FiFilter />
          <h2 className="font-bold">
            Search & Filters
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="relative md:col-span-2 xl:col-span-2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A3F4D]" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Order ID, customer, phone..."
              className="w-full rounded-2xl border border-[#eadbd4] bg-white py-3 pl-11 pr-4 text-sm text-[#5B3B32] outline-none transition focus:border-[#9A3F4D]"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm text-[#5B3B32] outline-none focus:border-[#9A3F4D]"
          >
            <option value="All">All Statuses</option>
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
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(event.target.value)
            }
            className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm text-[#5B3B32] outline-none focus:border-[#9A3F4D]"
          >
            <option value="All">
              All Payments
            </option>

            {PAYMENT_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) =>
              setFromDate(event.target.value)
            }
            className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm text-[#5B3B32] outline-none focus:border-[#9A3F4D]"
            title="From date"
          />

          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) =>
              setToDate(event.target.value)
            }
            className="rounded-2xl border border-[#eadbd4] bg-white px-4 py-3 text-sm text-[#5B3B32] outline-none focus:border-[#9A3F4D]"
            title="To date"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#8b746b]">
            Showing{" "}
            <strong className="text-[#5B3B32]">
              {filteredOrders.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[#5B3B32]">
              {orders.length}
            </strong>{" "}
            orders
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-[#9A3F4D] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => {
                const id =
                  order?._id || order?.id;
                const status =
                  getOrderStatus(order);
                const paymentStatus =
                  getPaymentStatus(order);

                const isFinalStatus = [
                  "Cancelled",
                  "Delivered",
                ].includes(status);

                const isUpdating =
                  updatingId === id;
                const isDeleting =
                  deletingId === id;

                return (
                  <tr
                    key={
                      id ||
                      order?.orderId ||
                      Math.random()
                    }
                    className="border-t border-[#eadbd4] text-[#5B3B32] transition hover:bg-[#fff7f3]"
                  >
                    <td className="p-4 font-bold text-[#9A3F4D]">
                      {order?.orderId || "-"}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold">
                        {getCustomerName(order)}
                      </p>

                      <p className="mt-1 max-w-[220px] truncate text-xs text-[#8b746b]">
                        {getCustomerEmail(order)}
                      </p>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {getCustomerPhone(order)}
                    </td>

                    <td className="p-4">
                      <div className="max-w-[280px] text-sm leading-5">
                        {Array.isArray(order?.items) &&
                        order.items.length
                          ? order.items
                              .map(
                                (item) =>
                                  `${
                                    item?.name ||
                                    "Item"
                                  } × ${
                                    item?.qty ||
                                    item?.quantity ||
                                    1
                                  }`
                              )
                              .join(", ")
                          : "No items"}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap font-bold">
                      {formatCurrency(
                        getOrderAmount(order)
                      )}
                    </td>

                    <td className="p-4">
                      <p className="text-sm font-medium">
                        {order?.paymentMethod || "-"}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${getPaymentClass(
                          paymentStatus
                        )}`}
                      >
                        {paymentStatus}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {formatDate(order?.createdAt)}
                    </td>

                    <td className="min-w-[190px] p-4">
                      {isFinalStatus ? (
                        <div>
                          <span
                            className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                          <p className="mt-2 text-[11px] text-[#8b746b]">
                            Final status — locked
                          </p>
                        </div>
                      ) : (
                        <select
                          value={status}
                          disabled={isUpdating}
                          onChange={(event) =>
                            handleStatusChange(
                              order,
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-[#eadbd4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9A3F4D] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.filter(
                            (option) =>
                              option !== "Cancelled"
                          ).map((option) => (
                            <option
                              key={option}
                              value={option}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {isUpdating && (
                        <p className="mt-2 text-xs text-[#9A3F4D]">
                          Updating...
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          className="flex items-center gap-2 rounded-xl bg-[#5B3B32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e2f29]"
                        >
                          <FiEye />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(order)
                          }
                          disabled={isDeleting}
                          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
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

        {!filteredOrders.length && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]">
              <FiShoppingBag size={28} />
            </div>

            <h3 className="mt-5 text-2xl font-semibold text-[#5B3B32]">
              No Orders Found
            </h3>

            <p className="mt-2 text-[#8b746b]">
              Search ya filters change karke dobara
              check karein.
            </p>
          </div>
        )}

        {filteredOrders.length > 0 && (
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
                className="rounded-xl border border-[#eadbd4] bg-white px-3 py-2 text-sm text-[#5B3B32] outline-none"
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
                <strong className="text-[#5B3B32]">
                  {page}
                </strong>{" "}
                of{" "}
                <strong className="text-[#5B3B32]">
                  {totalPages}
                </strong>
              </p>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={page <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbd4] bg-white text-[#5B3B32] disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbd4] bg-white text-[#5B3B32] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:bg-white">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#fffaf7] shadow-2xl print:max-h-none print:max-w-none print:rounded-none print:shadow-none">
            <header className="flex items-start justify-between gap-4 border-b border-[#eadbd4] px-6 py-6 md:px-8 print:border-b-2">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                  Order Details
                </p>

                <h2 className="heading-font mt-1 text-4xl text-[#5B3B32]">
                  {selectedOrder?.orderId || "Order"}
                </h2>

                <p className="mt-2 text-sm text-[#8b746b]">
                  {formatDate(
                    selectedOrder?.createdAt,
                    true
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={downloadInvoice}
                  className="flex items-center gap-2 rounded-xl bg-[#9A3F4D] px-4 py-3 font-semibold text-white"
                >
                  <FiDownload />
                  Invoice
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-xl border border-[#9A3F4D] px-4 py-3 font-semibold text-[#9A3F4D]"
                >
                  <FiPrinter />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4] text-[#5B3B32]"
                >
                  <FiX size={21} />
                </button>
              </div>
            </header>

            <div className="space-y-7 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-[#9A3F4D]" />

                    <h3 className="font-bold text-[#5B3B32]">
                      Customer Information
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#6d554d]">
                    <p>
                      <strong>Name:</strong>{" "}
                      {getCustomerName(
                        selectedOrder
                      )}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {getCustomerPhone(
                        selectedOrder
                      )}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {getCustomerEmail(
                        selectedOrder
                      )}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-[#9A3F4D]" />

                    <h3 className="font-bold text-[#5B3B32]">
                      Shipping Address
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#6d554d]">
                    {getAddressText(
                      selectedOrder
                    ) || "-"}
                  </p>
                </section>
              </div>

              <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="text-[#9A3F4D]" />

                  <h3 className="font-bold text-[#5B3B32]">
                    Ordered Items
                  </h3>
                </div>

                <div className="mt-5 space-y-4">
                  {Array.isArray(
                    selectedOrder?.items
                  ) &&
                  selectedOrder.items.length ? (
                    selectedOrder.items.map(
                      (item, index) => {
                        const quantity =
                          Number(
                            item?.qty ||
                              item?.quantity ||
                              1
                          );

                        const price = Number(
                          item?.price || 0
                        );

                        return (
                          <div
                            key={`${
                              item?.productId ||
                              item?._id ||
                              "item"
                            }-${index}`}
                            className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-b border-[#eadbd4] pb-4 last:border-b-0"
                          >
                            <div className="h-20 w-[72px] overflow-hidden rounded-xl bg-[#FDEAE6]">
                              {item?.image ? (
                                <img
                                  src={item.image}
                                  alt={
                                    item?.name ||
                                    "Product"
                                  }
                                  className="h-full w-full object-cover object-top"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#9A3F4D]">
                                  <FiPackage />
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-[#5B3B32]">
                                {item?.name ||
                                  "Product"}
                              </h4>

                              <p className="mt-1 text-sm text-[#8b746b]">
                                Size:{" "}
                                {item?.selectedSize ||
                                  item?.size ||
                                  "Free Size"}
                              </p>

                              <p className="text-sm text-[#8b746b]">
                                Qty: {quantity} ×{" "}
                                {formatCurrency(
                                  price
                                )}
                              </p>
                            </div>

                            <p className="whitespace-nowrap font-bold text-[#9A3F4D]">
                              {formatCurrency(
                                price * quantity
                              )}
                            </p>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="text-sm text-[#8b746b]">
                      No item details available.
                    </p>
                  )}
                </div>
              </section>

              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Payment & Status
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-[#6d554d]">
                    <div className="flex justify-between gap-4">
                      <span>Payment Method</span>

                      <strong>
                        {selectedOrder?.paymentMethod ||
                          "-"}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span>Payment Status</span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getPaymentClass(
                          getPaymentStatus(
                            selectedOrder
                          )
                        )}`}
                      >
                        {getPaymentStatus(
                          selectedOrder
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span>Order Status</span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                          getOrderStatus(
                            selectedOrder
                          )
                        )}`}
                      >
                        {getOrderStatus(
                          selectedOrder
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#eadbd4] bg-white p-5">
                  <h3 className="font-bold text-[#5B3B32]">
                    Price Breakdown
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-[#6d554d]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>

                      <strong>
                        {formatCurrency(
                          selectedOrder?.subtotal ??
                            selectedOrder?.amount ??
                            0
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between text-emerald-700">
                      <span>
                        Coupon{" "}
                        {selectedOrder?.couponCode
                          ? `(${selectedOrder.couponCode})`
                          : ""}
                      </span>

                      <strong>
                        -
                        {formatCurrency(
                          selectedOrder?.discountAmount ||
                            0
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>

                      <strong>
                        {Number(
                          selectedOrder?.shippingCharge ||
                            0
                        ) > 0
                          ? formatCurrency(
                              selectedOrder?.shippingCharge
                            )
                          : "Free"}
                      </strong>
                    </div>

                    <div className="flex justify-between border-t border-[#eadbd4] pt-3 text-lg text-[#5B3B32]">
                      <span>Grand Total</span>

                      <strong>
                        {formatCurrency(
                          getOrderAmount(
                            selectedOrder
                          )
                        )}
                      </strong>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersAdmin;