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

function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCoupons = async (showRefreshLoader = false) => {
    try {
      showRefreshLoader
        ? setRefreshing(true)
        : setLoading(true);

      const response = await getCoupons();

      if (response.success) {
        setCoupons(response.coupons || []);
      } else {
        alert(response.message || "Coupons load failed");
      }
    } catch (error) {
      console.error("Coupons load error:", error);

      alert(
        error.response?.data?.message ||
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
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      discountType:
        coupon.discountType || "Percentage",
      discountValue:
        coupon.discountValue ?? "",
      minimumOrderAmount:
        coupon.minimumOrderAmount ?? "",
      maximumDiscountAmount:
        coupon.maximumDiscountAmount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      oneUsePerCustomer:
        coupon.oneUsePerCustomer !== false,
      startDate: coupon.startDate
        ? new Date(coupon.startDate)
            .toISOString()
            .slice(0, 10)
        : "",
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate)
            .toISOString()
            .slice(0, 10)
        : "",
      isActive: coupon.isActive !== false,
      description: coupon.description || "",
    });

    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.code.trim() ||
      !form.discountValue ||
      !form.expiryDate
    ) {
      alert(
        "Code, discount value and expiry date are required"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(
          form.discountValue
        ),
        minimumOrderAmount: Number(
          form.minimumOrderAmount || 0
        ),
        maximumDiscountAmount:
          form.maximumDiscountAmount === ""
            ? null
            : Number(
                form.maximumDiscountAmount
              ),
        usageLimit:
          form.usageLimit === ""
            ? null
            : Number(form.usageLimit),
        description: form.description.trim(),
      };

      const response = editingCoupon
        ? await updateCoupon(
            editingCoupon._id,
            payload
          )
        : await createCoupon(payload);

      if (response.success) {
        alert(
          editingCoupon
            ? "Coupon updated successfully"
            : "Coupon created successfully"
        );

        closeForm();
        loadCoupons();
      } else {
        alert(
          response.message || "Coupon save failed"
        );
      }
    } catch (error) {
      console.error("Coupon save error:", error);

      alert(
        error.response?.data?.message ||
          "Coupon save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      const response =
        await toggleCouponStatus(coupon._id);

      if (response.success) {
        setCoupons((current) =>
          current.map((item) =>
            item._id === coupon._id
              ? {
                  ...item,
                  isActive: !item.isActive,
                }
              : item
          )
        );
      } else {
        alert(
          response.message ||
            "Coupon status update failed"
        );
      }
    } catch (error) {
      console.error("Coupon toggle error:", error);

      alert(
        error.response?.data?.message ||
          "Coupon status update failed"
      );
    }
  };

  const handleDelete = async (coupon) => {
    const ok = window.confirm(
      `Delete coupon ${coupon.code}?`
    );

    if (!ok) return;

    try {
      const response = await deleteCoupon(
        coupon._id
      );

      if (response.success) {
        setCoupons((current) =>
          current.filter(
            (item) => item._id !== coupon._id
          )
        );

        alert("Coupon deleted successfully");
      } else {
        alert(
          response.message ||
            "Coupon delete failed"
        );
      }
    } catch (error) {
      console.error("Coupon delete error:", error);

      alert(
        error.response?.data?.message ||
          "Coupon delete failed"
      );
    }
  };

  const filteredCoupons = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !query ||
        coupon.code
          ?.toLowerCase()
          .includes(query) ||
        coupon.description
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" &&
          coupon.isActive) ||
        (statusFilter === "Inactive" &&
          !coupon.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  const activeCoupons = coupons.filter(
    (coupon) => coupon.isActive
  ).length;

  const inactiveCoupons =
    coupons.length - activeCoupons;

  const totalUses = coupons.reduce(
    (sum, coupon) =>
      sum + Number(coupon.usedCount || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

          <h2 className="text-2xl font-bold text-[#5B3B32] mt-5">
            Loading Coupons...
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
            Promotions
          </p>

          <h1 className="heading-font text-4xl text-[#5B3B32] mt-1">
            Coupons
          </h1>

          <p className="text-[#8b746b] mt-2">
            Create and manage discount coupons.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search coupon..."
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none md:w-64"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => loadCoupons(true)}
            disabled={refreshing}
            className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="bg-[#9A3F4D] text-white px-5 py-3 rounded-xl font-semibold"
          >
            Add Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Coupons", coupons.length],
          ["Active", activeCoupons],
          ["Inactive", inactiveCoupons],
          ["Total Uses", totalUses],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5"
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

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">
                  Minimum Order
                </th>
                <th className="p-4">
                  Maximum Discount
                </th>
                <th className="p-4">Usage</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="border-t border-[#eadbd4] text-[#5B3B32]"
                >
                  <td className="p-4">
                    <p className="font-bold text-[#9A3F4D]">
                      {coupon.code}
                    </p>

                    {coupon.description && (
                      <p className="text-xs text-[#8b746b] mt-1 max-w-[240px]">
                        {coupon.description}
                      </p>
                    )}
                  </td>

                  <td className="p-4 font-semibold">
                    {coupon.discountType ===
                    "Percentage"
                      ? `${coupon.discountValue}%`
                      : `₹${Number(
                          coupon.discountValue
                        ).toLocaleString(
                          "en-IN"
                        )}`}
                  </td>

                  <td className="p-4">
                    ₹
                    {Number(
                      coupon.minimumOrderAmount ||
                        0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">
                    {coupon.maximumDiscountAmount
                      ? `₹${Number(
                          coupon.maximumDiscountAmount
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      : "-"}
                  </td>

                  <td className="p-4">
                    {coupon.usedCount || 0}
                    {coupon.usageLimit
                      ? ` / ${coupon.usageLimit}`
                      : ""}
                  </td>

                  <td className="p-4">
                    {coupon.expiryDate
                      ? new Date(
                          coupon.expiryDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggle(coupon)
                      }
                      className={`px-4 py-2 rounded-full border text-xs font-bold ${
                        coupon.isActive
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {coupon.isActive
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(coupon)
                        }
                        className="bg-[#5B3B32] text-white px-4 py-2 rounded-xl text-sm"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(coupon)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-16">
            <h3 className="heading-font text-3xl text-[#5B3B32]">
              No Coupons Found
            </h3>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#fffaf7] rounded-3xl shadow-2xl">
            <div className="px-6 py-5 border-b border-[#eadbd4]">
              <h2 className="heading-font text-3xl text-[#5B3B32]">
                {editingCoupon
                  ? "Edit Coupon"
                  : "Create Coupon"}
              </h2>
            </div>

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
                />
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
                  <option>Percentage</option>
                  <option>Flat</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#5B3B32]">
                  Discount Value
                </label>

                <input
                  type="number"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleChange}
                  className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#5B3B32]">
                  Minimum Order
                </label>

                <input
                  type="number"
                  name="minimumOrderAmount"
                  value={
                    form.minimumOrderAmount
                  }
                  onChange={handleChange}
                  className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#5B3B32]">
                  Maximum Discount
                </label>

                <input
                  type="number"
                  name="maximumDiscountAmount"
                  value={
                    form.maximumDiscountAmount
                  }
                  onChange={handleChange}
                  className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#5B3B32]">
                  Usage Limit
                </label>

                <input
                  type="number"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={handleChange}
                  className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                  placeholder="Optional"
                />
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
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3"
                />
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
                  className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3 resize-none"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="oneUsePerCustomer"
                  checked={
                    form.oneUsePerCustomer
                  }
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
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponsAdmin;