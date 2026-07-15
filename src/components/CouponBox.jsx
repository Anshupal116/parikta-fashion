import { useState } from "react";
import { FiCheckCircle, FiTag, FiX } from "react-icons/fi";

import { applyCoupon } from "../services/couponService";
import { useCart } from "../context/CartContext";

function CouponBox() {
  const {
    cartTotal,
    appliedCoupon,
    applyCouponToCart,
    removeCoupon,
  } = useCart();

  const [code, setCode] = useState(
    appliedCoupon?.coupon?.code || ""
  );
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleApply = async () => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setMessage("Please enter a coupon code");
      setMessageType("error");
      return;
    }

    try {
      setApplying(true);
      setMessage("");

      const response = await applyCoupon(
        normalizedCode,
        cartTotal
      );

      if (response.success) {
        applyCouponToCart({
          coupon: response.coupon,
          discountAmount: response.discountAmount,
          originalAmount: response.originalAmount,
          finalAmount: response.finalAmount,
        });

        setCode(response.coupon.code);
        setMessage(
          `Coupon applied. You saved ₹${Number(
            response.discountAmount || 0
          ).toLocaleString("en-IN")}`
        );
        setMessageType("success");
      } else {
        setMessage(response.message || "Coupon apply failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Coupon apply failed"
      );
      setMessageType("error");
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setCode("");
    setMessage("Coupon removed");
    setMessageType("success");
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <FiCheckCircle
              className="text-green-700 mt-1 shrink-0"
              size={20}
            />

            <div>
              <p className="font-bold text-green-800">
                {appliedCoupon.coupon?.code} applied
              </p>

              <p className="text-sm text-green-700 mt-1">
                You saved ₹
                {Number(
                  appliedCoupon.discountAmount || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove coupon"
            className="text-green-700 hover:text-red-600"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#eadbd4] rounded-2xl p-4 bg-white">
      <div className="flex items-center gap-2 text-[#5B3B32]">
        <FiTag />
        <h3 className="font-bold">Apply Coupon</h3>
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={code}
          onChange={(event) =>
            setCode(event.target.value.toUpperCase())
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleApply();
            }
          }}
          placeholder="Enter coupon code"
          className="min-w-0 flex-1 border border-[#eadbd4] rounded-xl px-4 py-3 uppercase outline-none focus:border-[#9A3F4D]"
        />

        <button
          type="button"
          onClick={handleApply}
          disabled={applying || cartTotal <= 0}
          className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {applying ? "Applying..." : "Apply"}
        </button>
      </div>

      {message && (
        <p
          className={`text-sm mt-3 ${
            messageType === "error"
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default CouponBox;