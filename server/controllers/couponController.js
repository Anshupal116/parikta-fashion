const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

const normalizeCode = (code = "") =>
  String(code).trim().toUpperCase();

const calculateCouponDiscount = (coupon, cartTotal) => {
  let discountAmount = 0;

  if (coupon.discountType === "Percentage") {
    discountAmount =
      (Number(cartTotal) *
        Number(coupon.discountValue)) /
      100;

    if (
      coupon.maximumDiscountAmount !== null &&
      coupon.maximumDiscountAmount !== undefined
    ) {
      discountAmount = Math.min(
        discountAmount,
        Number(coupon.maximumDiscountAmount)
      );
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  discountAmount = Math.min(
    discountAmount,
    Number(cartTotal)
  );

  return Math.round(discountAmount);
};

// =====================================
// CUSTOMER: VALIDATE/APPLY COUPON
// =====================================

exports.applyCoupon = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code);
    const cartTotal = Number(req.body.cartTotal);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code",
      });
    }

    if (!Number.isFinite(cartTotal) || cartTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart total",
      });
    }

    const coupon = await Coupon.findOne({
      code,
    }).lean();

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive",
      });
    }

    const now = new Date();

    if (
      coupon.startDate &&
      now < new Date(coupon.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet",
      });
    }

    if (
      coupon.expiryDate &&
      now > new Date(coupon.expiryDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      Number(coupon.usedCount) >=
        Number(coupon.usageLimit)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon usage limit is over",
      });
    }

    if (
      cartTotal <
      Number(coupon.minimumOrderAmount || 0)
    ) {
      const requiredAmount =
        Number(coupon.minimumOrderAmount) -
        cartTotal;

      return res.status(400).json({
        success: false,
        message: `Add ₹${requiredAmount.toLocaleString(
          "en-IN"
        )} more to use this coupon`,
      });
    }

    if (
      coupon.oneUsePerCustomer &&
      req.customer?._id
    ) {
      const alreadyUsed = coupon.usedBy?.some(
        (entry) =>
          String(entry.customerId) ===
          String(req.customer._id)
      );

      if (alreadyUsed) {
        return res.status(400).json({
          success: false,
          message:
            "You have already used this coupon",
        });
      }
    }

    const discountAmount =
      calculateCouponDiscount(coupon, cartTotal);

    const finalAmount = Math.max(
      cartTotal - discountAmount,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount:
          coupon.minimumOrderAmount,
        maximumDiscountAmount:
          coupon.maximumDiscountAmount,
      },
      discountAmount,
      originalAmount: cartTotal,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Coupon apply failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: CREATE COUPON
// =====================================

exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      oneUsePerCustomer,
      startDate,
      expiryDate,
      isActive,
      description,
    } = req.body;

    const normalizedCode = normalizeCode(code);

    if (
      !normalizedCode ||
      !discountType ||
      !discountValue ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Code, discount type, discount value and expiry date are required",
      });
    }

    if (
      !["Percentage", "Flat"].includes(
        discountType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (
      discountType === "Percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot exceed 100%",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(
        minimumOrderAmount || 0
      ),
      maximumDiscountAmount:
        maximumDiscountAmount === "" ||
        maximumDiscountAmount === null ||
        maximumDiscountAmount === undefined
          ? null
          : Number(maximumDiscountAmount),
      usageLimit:
        usageLimit === "" ||
        usageLimit === null ||
        usageLimit === undefined
          ? null
          : Number(usageLimit),
      oneUsePerCustomer:
        oneUsePerCustomer !== false,
      startDate: startDate || new Date(),
      expiryDate,
      isActive: isActive !== false,
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Coupon create failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: GET ALL COUPONS
// =====================================

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .select("-usedBy")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    return res.status(500).json({
      success: false,
      message: "Coupons load failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: UPDATE COUPON
// =====================================

exports.updateCoupon = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const updates = {
      ...req.body,
    };

    if (updates.code) {
      updates.code = normalizeCode(updates.code);
    }

    if (updates.discountValue !== undefined) {
      updates.discountValue = Number(
        updates.discountValue
      );
    }

    if (
      updates.minimumOrderAmount !== undefined
    ) {
      updates.minimumOrderAmount = Number(
        updates.minimumOrderAmount
      );
    }

    if (
      updates.maximumDiscountAmount === ""
    ) {
      updates.maximumDiscountAmount = null;
    }

    if (updates.usageLimit === "") {
      updates.usageLimit = null;
    }

    if (
      updates.discountType === "Percentage" &&
      Number(updates.discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot exceed 100%",
      });
    }

    const coupon =
      await Coupon.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    console.error("Update coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Coupon update failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: TOGGLE COUPON STATUS
// =====================================

exports.toggleCouponStatus = async (
  req,
  res
) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${
        coupon.isActive ? "activated" : "disabled"
      } successfully`,
      coupon,
    });
  } catch (error) {
    console.error(
      "Toggle coupon error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Coupon status update failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: DELETE COUPON
// =====================================

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon =
      await Coupon.findByIdAndDelete(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Coupon delete failed",
      error: error.message,
    });
  }
};