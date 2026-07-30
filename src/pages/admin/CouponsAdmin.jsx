import { useEffect, useMemo, useState } from "react";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
} from "../../services/couponService";

const emptyForm = {
  code: "",
  discountType: "Percentage",
  discountValue: "",
  minimumOrderAmount: "",
  maximumDiscountAmount: "",
  usageLimit: "",
  oneUsePerCustomer: true,
  startDate: "",
  expiryDate: "",
  isActive: true,
  description: "",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getCouponLifecycle = (coupon) => {
  const now = new Date();
  const start = coupon.startDate ? new Date(coupon.startDate) : null;
  const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;

  if (expiry && expiry < now) return "Expired";
  if (start && start > now) return "Scheduled";
  if (coupon.isActive) return "Active";
  return "Inactive";
};

const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) return null;

  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getUsagePercentage = (coupon) => {
  const limit = Number(coupon.usageLimit || 0);
  const used = Number(coupon.usedCount || 0);

  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};

function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [usageFilter, setUsageFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkWorking, setBulkWorking] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [copyMessage, setCopyMessage] = useState("");

  const loadCoupons = async (showRefreshLoader = false) => {
    try {
      showRefreshLoader ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await getCoupons();

      if (response?.success === false) {
        throw new Error(response.message || "Coupons load failed");
      }

      const list =
        response?.coupons ||
        response?.data?.coupons ||
        response?.data ||
        [];

      setCoupons(Array.isArray(list) ? list : []);
      setSelectedIds([]);
    } catch (loadError) {
      console.error("Coupons load error:", loadError);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Coupons load failed"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "Percentage",
      discountValue: coupon.discountValue ?? "",
      minimumOrderAmount: coupon.minimumOrderAmount ?? "",
      maximumDiscountAmount: coupon.maximumDiscountAmount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      oneUsePerCustomer: coupon.oneUsePerCustomer !== false,
      startDate: toInputDate(coupon.startDate),
      expiryDate: toInputDate(coupon.expiryDate),
      isActive: coupon.isActive !== false,
      description: coupon.description || "",
    });

    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let nextValue = type === "checkbox" ? checked : value;

    if (name === "code") {
      nextValue = value.toUpperCase().replace(/\s+/g, "");
    }

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};
    const discountValue = Number(form.discountValue || 0);
    const minimumOrderAmount = Number(form.minimumOrderAmount || 0);
    const maximumDiscountAmount =
      form.maximumDiscountAmount === ""
        ? null
        : Number(form.maximumDiscountAmount);
    const usageLimit =
      form.usageLimit === "" ? null : Number(form.usageLimit);

    if (!form.code.trim()) {
      errors.code = "Coupon code is required";
    }

    const duplicateCoupon = coupons.find(
      (coupon) =>
        coupon.code?.toUpperCase() === form.code.trim().toUpperCase() &&
        coupon._id !== editingCoupon?._id
    );

    if (duplicateCoupon) {
      errors.code = "This coupon code already exists";
    }

    if (!discountValue || discountValue <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    }

    if (form.discountType === "Percentage" && discountValue > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100";
    }

    if (minimumOrderAmount < 0) {
      errors.minimumOrderAmount = "Minimum order cannot be negative";
    }

    if (
      maximumDiscountAmount !== null &&
      (!maximumDiscountAmount || maximumDiscountAmount <= 0)
    ) {
      errors.maximumDiscountAmount = "Maximum discount must be greater than 0";
    }

    if (usageLimit !== null && (!usageLimit || usageLimit <= 0)) {
      errors.usageLimit = "Usage limit must be greater than 0";
    }

    if (!form.expiryDate) {
      errors.expiryDate = "Expiry date is required";
    }

    if (
      form.startDate &&
      form.expiryDate &&
      new Date(form.expiryDate) < new Date(form.startDate)
    ) {
      errors.expiryDate = "Expiry date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount || 0),
        maximumDiscountAmount:
          form.maximumDiscountAmount === ""
            ? null
            : Number(form.maximumDiscountAmount),
        usageLimit:
          form.usageLimit === ""
            ? null
            : Number(form.usageLimit),
        description: form.description.trim(),
      };

      const response = editingCoupon
        ? await updateCoupon(editingCoupon._id, payload)
        : await createCoupon(payload);

      if (response?.success === false) {
        throw new Error(response.message || "Coupon save failed");
      }

      closeForm();
      await loadCoupons();
    } catch (saveError) {
      console.error("Coupon save error:", saveError);
      window.alert(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "Coupon save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      const response = await toggleCouponStatus(coupon._id);

      if (response?.success === false) {
        throw new Error(response.message || "Coupon status update failed");
      }

      setCoupons((current) =>
        current.map((item) =>
          item._id === coupon._id
            ? {
                ...item,
                isActive:
                  response?.coupon?.isActive ??
                  response?.data?.isActive ??
                  !item.isActive,
              }
            : item
        )
      );
    } catch (toggleError) {
      console.error("Coupon toggle error:", toggleError);
      window.alert(
        toggleError?.response?.data?.message ||
          toggleError?.message ||
          "Coupon status update failed"
      );
    }
  };

  const handleDelete = async (coupon) => {
    const ok = window.confirm(`Delete coupon ${coupon.code}?`);
    if (!ok) return;

    try {
      const response = await deleteCoupon(coupon._id);

      if (response?.success === false) {
        throw new Error(response.message || "Coupon delete failed");
      }

      setCoupons((current) =>
        current.filter((item) => item._id !== coupon._id)
      );

      setSelectedIds((current) =>
        current.filter((id) => id !== coupon._id)
      );
    } catch (deleteError) {
      console.error("Coupon delete error:", deleteError);
      window.alert(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Coupon delete failed"
      );
    }
  };

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = coupons.filter((coupon) => {
      const lifecycle = getCouponLifecycle(coupon);
      const usagePercent = getUsagePercentage(coupon);

      const matchesSearch =
        !query ||
        coupon.code?.toLowerCase().includes(query) ||
        coupon.description?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || lifecycle === statusFilter;

      const matchesType =
        typeFilter === "All" || coupon.discountType === typeFilter;

      const matchesUsage =
        usageFilter === "All" ||
        (usageFilter === "Unused" && Number(coupon.usedCount || 0) === 0) ||
        (usageFilter === "Low" && usagePercent > 0 && usagePercent < 50) ||
        (usageFilter === "High" && usagePercent >= 50 && usagePercent < 100) ||
        (usageFilter === "Exhausted" && usagePercent >= 100);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesUsage
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sortBy === "expirySoon") {
        return (
          new Date(a.expiryDate || "9999-12-31") -
          new Date(b.expiryDate || "9999-12-31")
        );
      }

      if (sortBy === "usageHigh") {
        return Number(b.usedCount || 0) - Number(a.usedCount || 0);
      }

      if (sortBy === "discountHigh") {
        return Number(b.discountValue || 0) - Number(a.discountValue || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [
    coupons,
    search,
    statusFilter,
    typeFilter,
    usageFilter,
    sortBy,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [
    search,
    statusFilter,
    typeFilter,
    usageFilter,
    sortBy,
    pageSize,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCoupons.length / pageSize)
  );

  const paginatedCoupons = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(
      (coupon) => getCouponLifecycle(coupon) === "Active"
    ).length;
    const scheduled = coupons.filter(
      (coupon) => getCouponLifecycle(coupon) === "Scheduled"
    ).length;
    const expired = coupons.filter(
      (coupon) => getCouponLifecycle(coupon) === "Expired"
    ).length;
    const totalUses = coupons.reduce(
      (sum, coupon) => sum + Number(coupon.usedCount || 0),
      0
    );

    return {
      total,
      active,
      scheduled,
      expired,
      totalUses,
    };
  }, [coupons]);

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleSelectPage = () => {
    const pageIds = paginatedCoupons.map((coupon) => coupon._id);
    const allSelected =
      pageIds.length > 0 &&
      pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([...current, ...pageIds]),
      ]);
    }
  };

  const handleBulkToggle = async (makeActive) => {
    if (!selectedIds.length) return;

    const selectedCoupons = coupons.filter((coupon) =>
      selectedIds.includes(coupon._id)
    );

    const couponsToChange = selectedCoupons.filter(
      (coupon) => Boolean(coupon.isActive) !== makeActive
    );

    if (!couponsToChange.length) {
      window.alert(
        makeActive
          ? "Selected coupons are already active"
          : "Selected coupons are already inactive"
      );
      return;
    }

    const ok = window.confirm(
      `${couponsToChange.length} coupons ${
        makeActive ? "activate" : "deactivate"
      } karne hain?`
    );

    if (!ok) return;

    try {
      setBulkWorking(true);

      const results = await Promise.allSettled(
        couponsToChange.map((coupon) =>
          toggleCouponStatus(coupon._id)
        )
      );

      const successIds = results
        .map((result, index) => ({
          result,
          id: couponsToChange[index]._id,
        }))
        .filter(
          ({ result }) =>
            result.status === "fulfilled" &&
            result.value?.success !== false
        )
        .map(({ id }) => id);

      setCoupons((current) =>
        current.map((coupon) =>
          successIds.includes(coupon._id)
            ? { ...coupon, isActive: makeActive }
            : coupon
        )
      );

      setSelectedIds([]);
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const ok = window.confirm(
      `${selectedIds.length} selected coupons permanently delete karne hain?`
    );

    if (!ok) return;

    try {
      setBulkWorking(true);

      const results = await Promise.allSettled(
        selectedIds.map((id) => deleteCoupon(id))
      );

      const deletedIds = results
        .map((result, index) => ({
          result,
          id: selectedIds[index],
        }))
        .filter(
          ({ result }) =>
            result.status === "fulfilled" &&
            result.value?.success !== false
        )
        .map(({ id }) => id);

      setCoupons((current) =>
        current.filter((coupon) => !deletedIds.includes(coupon._id))
      );

      setSelectedIds([]);
    } finally {
      setBulkWorking(false);
    }
  };

  const copyCouponCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyMessage(`${code} copied`);
      setTimeout(() => setCopyMessage(""), 1800);
    } catch {
      window.alert("Coupon code copy nahi hua");
    }
  };

  const exportCsv = () => {
    if (!filteredCoupons.length) {
      window.alert("Export ke liye coupons nahi hain");
      return;
    }

    const rows = filteredCoupons.map((coupon) => ({
      Code: coupon.code || "",
      Type: coupon.discountType || "",
      Value: coupon.discountValue || 0,
      "Minimum Order": coupon.minimumOrderAmount || 0,
      "Maximum Discount": coupon.maximumDiscountAmount || "",
      "Usage Count": coupon.usedCount || 0,
      "Usage Limit": coupon.usageLimit || "",
      "One Use Per Customer": coupon.oneUsePerCustomer ? "Yes" : "No",
      "Start Date": coupon.startDate || "",
      "Expiry Date": coupon.expiryDate || "",
      Status: getCouponLifecycle(coupon),
      Description: coupon.description || "",
    }));

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "").replace(/"/g, '""');
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
    link.download = `parikta-coupons-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setUsageFilter("All");
    setSortBy("newest");
  };

  const previewDiscount =
    form.discountType === "Percentage"
      ? `${Number(form.discountValue || 0)}% OFF`
      : `${formatCurrency(form.discountValue)} OFF`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-[#5B3B32] mt-5">
            Loading Coupons...
          </h2>
          <p className="text-sm text-[#8b746b] mt-2">
            Promotion data fetch ho raha hai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
            Promotions
          </p>
          <h1 className="heading-font text-4xl text-[#5B3B32] mt-1">
            Coupons
          </h1>
          <p className="text-[#8b746b] mt-2">
            Create, monitor and manage discount campaigns.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="border border-[#9A3F4D] bg-white text-[#9A3F4D] px-5 py-3 rounded-xl font-semibold"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => loadCoupons(true)}
            disabled={refreshing}
            className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="bg-[#9A3F4D] text-white px-5 py-3 rounded-xl font-semibold"
          >
            + Add Coupon
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-bold text-red-700">
            Coupons load nahi hue
          </h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            type="button"
            onClick={() => loadCoupons()}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {copyMessage && (
        <div className="fixed right-5 top-5 z-[700] rounded-xl bg-[#5B3B32] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {copyMessage}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          ["Total Coupons", stats.total],
          ["Active", stats.active],
          ["Scheduled", stats.scheduled],
          ["Expired", stats.expired],
          ["Total Uses", stats.totalUses],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm"
          >
            <h2 className="heading-font text-4xl text-[#9A3F4D]">
              {value}
            </h2>
            <p className="text-[11px] tracking-[0.16em] uppercase text-[#5B3B32] mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 mb-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search coupon or description..."
            className="xl:col-span-2 border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="All">All Discount Types</option>
            <option value="Percentage">Percentage</option>
            <option value="Flat">Flat</option>
          </select>

          <select
            value={usageFilter}
            onChange={(event) => setUsageFilter(event.target.value)}
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="All">All Usage</option>
            <option value="Unused">Unused</option>
            <option value="Low">Low Usage</option>
            <option value="High">High Usage</option>
            <option value="Exhausted">Exhausted</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="expirySoon">Expiry Soon</option>
            <option value="usageHigh">Highest Usage</option>
            <option value="discountHigh">Highest Discount</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-[#8b746b]">
            Showing{" "}
            <strong className="text-[#5B3B32]">
              {filteredCoupons.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[#5B3B32]">{coupons.length}</strong>
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-[#9A3F4D]"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-[#eadbd4] bg-[#FDEAE6] p-4">
          <p className="font-semibold text-[#5B3B32]">
            {selectedIds.length} coupons selected
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkWorking}
              onClick={() => handleBulkToggle(true)}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Activate
            </button>

            <button
              type="button"
              disabled={bulkWorking}
              onClick={() => handleBulkToggle(false)}
              className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Deactivate
            </button>

            <button
              type="button"
              disabled={bulkWorking}
              onClick={handleBulkDelete}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Delete
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-xl border border-[#9A3F4D] bg-white px-4 py-2 text-sm font-semibold text-[#9A3F4D]"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCoupons.length > 0 &&
                      paginatedCoupons.every((coupon) =>
                        selectedIds.includes(coupon._id)
                      )
                    }
                    onChange={toggleSelectPage}
                  />
                </th>
                <th className="p-4">Coupon</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Minimum Order</th>
                <th className="p-4">Maximum Discount</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCoupons.map((coupon) => {
                const lifecycle = getCouponLifecycle(coupon);
                const daysRemaining = getDaysRemaining(coupon.expiryDate);
                const usagePercent = getUsagePercentage(coupon);
                const usedCount = Number(coupon.usedCount || 0);

                return (
                  <tr
                    key={coupon._id}
                    className="border-t border-[#eadbd4] text-[#5B3B32] align-top hover:bg-[#fff7f3]"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(coupon._id)}
                        onChange={() => toggleSelect(coupon._id)}
                      />
                    </td>

                    <td className="p-4 min-w-[240px]">
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="font-bold text-[#9A3F4D] text-lg">
                            {coupon.code}
                          </p>

                          {coupon.description && (
                            <p className="text-xs text-[#8b746b] mt-1 max-w-[260px] leading-5">
                              {coupon.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => copyCouponCode(coupon.code)}
                          className="text-xs border border-[#eadbd4] bg-white rounded-lg px-2 py-1"
                        >
                          Copy
                        </button>
                      </div>
                    </td>

                    <td className="p-4 font-semibold">
                      {coupon.discountType === "Percentage"
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                      <p className="text-xs text-[#8b746b] mt-1">
                        {coupon.discountType}
                      </p>
                    </td>

                    <td className="p-4">
                      {formatCurrency(coupon.minimumOrderAmount)}
                    </td>

                    <td className="p-4">
                      {coupon.maximumDiscountAmount
                        ? formatCurrency(coupon.maximumDiscountAmount)
                        : "-"}
                    </td>

                    <td className="p-4 min-w-[230px]">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-semibold">
                          {usedCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </span>
                        <span className="text-xs text-[#8b746b]">
                          {coupon.usageLimit ? `${usagePercent}%` : "Unlimited"}
                        </span>
                      </div>

                      {coupon.usageLimit && (
                        <div className="mt-2 h-2 rounded-full bg-[#eee4df] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#9A3F4D]"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}

                      <p className="text-xs text-[#8b746b] mt-2">
                        {coupon.oneUsePerCustomer
                          ? "One use per customer"
                          : "Multiple use allowed"}
                      </p>
                    </td>

                    <td className="p-4 min-w-[180px]">
                      <p className="text-sm">
                        {formatDate(coupon.startDate)} -{" "}
                        {formatDate(coupon.expiryDate)}
                      </p>

                      <p
                        className={`text-xs mt-2 font-semibold ${
                          daysRemaining === null
                            ? "text-[#8b746b]"
                            : daysRemaining < 0
                              ? "text-red-600"
                              : daysRemaining <= 3
                                ? "text-orange-600"
                                : "text-green-700"
                        }`}
                      >
                        {daysRemaining === null
                          ? "No expiry"
                          : daysRemaining < 0
                            ? `Expired ${Math.abs(daysRemaining)} days ago`
                            : daysRemaining === 0
                              ? "Expires today"
                              : `${daysRemaining} days remaining`}
                      </p>
                    </td>

                    <td className="p-4 min-w-[130px]">
                      <span
                        className={`inline-flex px-3 py-2 rounded-full border text-xs font-bold ${
                          lifecycle === "Active"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : lifecycle === "Scheduled"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : lifecycle === "Expired"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-gray-100 border-gray-200 text-gray-600"
                        }`}
                      >
                        {lifecycle}
                      </span>
                    </td>

                    <td className="p-4 min-w-[250px]">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(coupon)}
                          className="bg-[#5B3B32] text-white px-4 py-2 rounded-xl text-sm"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(coupon)}
                          className={`px-4 py-2 rounded-xl text-sm text-white ${
                            coupon.isActive
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(coupon)}
                          className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-16 px-5">
            <h3 className="heading-font text-3xl text-[#5B3B32]">
              No Coupons Found
            </h3>
            <p className="text-[#8b746b] mt-2">
              Search ya filters change karke dobara check karein.
            </p>
          </div>
        )}

        {filteredCoupons.length > 0 && (
          <div className="border-t border-[#eadbd4] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8b746b]">Rows per page</span>

              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="border border-[#eadbd4] rounded-xl px-3 py-2 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="border border-[#eadbd4] rounded-xl px-4 py-2 bg-white disabled:opacity-40"
              >
                Previous
              </button>

              <p className="text-sm text-[#8b746b]">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </p>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="border border-[#eadbd4] rounded-xl px-4 py-2 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-5xl max-h-[94vh] overflow-y-auto bg-[#fffaf7] rounded-3xl shadow-2xl">
            <div className="px-6 py-5 border-b border-[#eadbd4] flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
                  Promotion Setup
                </p>
                <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
                  {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="w-10 h-10 rounded-full border border-[#eadbd4] text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid xl:grid-cols-[1.4fr_0.8fr]">
              <form
                onSubmit={handleSubmit}
                className="p-6 grid md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Coupon Code
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3 uppercase"
                    placeholder="WELCOME10"
                    maxLength={30}
                  />
                  {formErrors.code && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Flat">Flat</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                    placeholder={form.discountType === "Percentage" ? "10" : "500"}
                  />
                  {formErrors.discountValue && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.discountValue}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Minimum Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="minimumOrderAmount"
                    value={form.minimumOrderAmount}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                  />
                  {formErrors.minimumOrderAmount && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.minimumOrderAmount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Maximum Discount
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="maximumDiscountAmount"
                    value={form.maximumDiscountAmount}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                    placeholder="Optional"
                  />
                  {formErrors.maximumDiscountAmount && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.maximumDiscountAmount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                    placeholder="Optional"
                  />
                  {formErrors.usageLimit && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.usageLimit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    min={form.startDate || undefined}
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                  />
                  {formErrors.expiryDate && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.expiryDate}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[#5B3B32]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3 resize-none"
                    placeholder="Short campaign description..."
                  />
                  <p className="text-xs text-[#8b746b] text-right mt-1">
                    {form.description.length}/500
                  </p>
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="oneUsePerCustomer"
                    checked={form.oneUsePerCustomer}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-semibold text-[#5B3B32]">
                    One use per customer
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-semibold text-[#5B3B32]">
                    Coupon active
                  </span>
                </label>

                <div className="md:col-span-2 flex justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="border border-[#9A3F4D] text-[#9A3F4D] px-6 py-3 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#9A3F4D] text-white px-6 py-3 rounded-xl disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingCoupon
                        ? "Update Coupon"
                        : "Create Coupon"}
                  </button>
                </div>
              </form>

              <aside className="border-t xl:border-t-0 xl:border-l border-[#eadbd4] p-6 bg-[#fff7f3]">
                <p className="text-xs tracking-[0.2em] uppercase text-[#BFA996]">
                  Live Preview
                </p>

                <div className="mt-5 rounded-3xl bg-[#5B3B32] text-white p-6 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#e9cfc6]">
                    Parikta Fashion
                  </p>

                  <h3 className="heading-font text-4xl mt-4">
                    {previewDiscount}
                  </h3>

                  <p className="text-sm mt-2 text-[#f7e8e2]">
                    {form.description || "Special discount on your order"}
                  </p>

                  <div className="mt-6 border border-dashed border-white/40 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
                    <span className="font-bold tracking-[0.15em]">
                      {form.code || "COUPONCODE"}
                    </span>
                    <span className="text-xs">COPY</span>
                  </div>

                  <div className="mt-5 space-y-2 text-xs text-[#f7e8e2]">
                    <p>
                      Minimum order:{" "}
                      <strong>{formatCurrency(form.minimumOrderAmount)}</strong>
                    </p>

                    {form.maximumDiscountAmount && (
                      <p>
                        Maximum discount:{" "}
                        <strong>
                          {formatCurrency(form.maximumDiscountAmount)}
                        </strong>
                      </p>
                    )}

                    <p>
                      Valid till:{" "}
                      <strong>{formatDate(form.expiryDate)}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#eadbd4] bg-white p-4">
                  <h4 className="font-bold text-[#5B3B32]">
                    Coupon Summary
                  </h4>

                  <div className="mt-3 space-y-2 text-sm text-[#6d554d]">
                    <p>
                      Type: <strong>{form.discountType}</strong>
                    </p>
                    <p>
                      Usage:{" "}
                      <strong>
                        {form.usageLimit || "Unlimited"}
                      </strong>
                    </p>
                    <p>
                      Customer rule:{" "}
                      <strong>
                        {form.oneUsePerCustomer
                          ? "One use only"
                          : "Multiple uses"}
                      </strong>
                    </p>
                    <p>
                      Status:{" "}
                      <strong>
                        {form.isActive ? "Active" : "Inactive"}
                      </strong>
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponsAdmin;