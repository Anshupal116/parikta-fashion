const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const crypto = require("crypto");
const razorpay = require("../config/razorpay");

const sendEmail = require("../utils/sendEmail");
const orderConfirmationTemplate = require("../utils/orderConfirmationTemplate");

const normalizeCode = (code = "") => {
  return String(code).trim().toUpperCase();
};

const calculateCouponDiscount = (
  coupon,
  subtotal
) => {
  let discountAmount = 0;

  if (coupon.discountType === "Percentage") {
    discountAmount =
      (Number(subtotal) *
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
    discountAmount = Number(
      coupon.discountValue
    );
  }

  discountAmount = Math.min(
    discountAmount,
    Number(subtotal)
  );

  return Math.max(
    Math.round(discountAmount),
    0
  );
};

const validateCouponForCustomer = async ({
  couponCode,
  customerId,
  subtotal,
}) => {
  const normalizedCode =
    normalizeCode(couponCode);

  if (!normalizedCode) {
    return {
      coupon: null,
      discountAmount: 0,
    };
  }

  const coupon = await Coupon.findOne({
    code: normalizedCode,
  });

  if (!coupon) {
    const error = new Error(
      "Invalid coupon code"
    );

    error.statusCode = 400;
    throw error;
  }

  if (!coupon.isActive) {
    const error = new Error(
      "This coupon is inactive"
    );

    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  if (
    coupon.startDate &&
    now < new Date(coupon.startDate)
  ) {
    const error = new Error(
      "This coupon is not active yet"
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    coupon.expiryDate &&
    now > new Date(coupon.expiryDate)
  ) {
    const error = new Error(
      "This coupon has expired"
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    Number(coupon.usedCount) >=
      Number(coupon.usageLimit)
  ) {
    const error = new Error(
      "This coupon usage limit is over"
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    Number(subtotal) <
    Number(coupon.minimumOrderAmount || 0)
  ) {
    const requiredAmount =
      Number(
        coupon.minimumOrderAmount || 0
      ) - Number(subtotal);

    const error = new Error(
      `Add ₹${requiredAmount.toLocaleString(
        "en-IN"
      )} more to use this coupon`
    );

    error.statusCode = 400;
    throw error;
  }

  if (coupon.oneUsePerCustomer) {
    const alreadyUsed =
      coupon.usedBy?.some(
        (entry) =>
          String(entry.customerId) ===
          String(customerId)
      );

    if (alreadyUsed) {
      const error = new Error(
        "You have already used this coupon"
      );

      error.statusCode = 400;
      throw error;
    }
  }

  return {
    coupon,

    discountAmount:
      calculateCouponDiscount(
        coupon,
        subtotal
      ),
  };
};

// =====================================
// CREATE ORDER
// =====================================

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      address,
      items,
      paymentMethod,
      couponCode,
    } = req.body;

    if (
      !customer?.name?.trim() ||
      !customer?.phone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and phone are required",
      });
    }

    if (
      !address?.house?.trim() ||
      !address?.city?.trim() ||
      !address?.state?.trim() ||
      !address?.pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete delivery address is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const requestedProductIds =
      items.map(
        (item) => item.productId
      );

    const invalidProductId =
      requestedProductIds.find(
        (id) =>
          !mongoose.Types.ObjectId.isValid(
            id
          )
      );

    if (invalidProductId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product in cart",
      });
    }

    const products = await Product.find({
      _id: {
        $in: requestedProductIds,
      },

      isActive: {
        $ne: false,
      },
    }).lean();

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    const sanitizedItems = [];

    for (const item of items) {
      const product = productMap.get(
        String(item.productId)
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "One or more products are unavailable",
        });
      }

      const qty = Math.max(
        Number.parseInt(item.qty, 10) ||
          1,
        1
      );

      if (
        Number(product.stock || 0) > 0 &&
        qty > Number(product.stock)
      ) {
        return res.status(400).json({
          success: false,

          message: `Only ${product.stock} item(s) available for ${product.name}`,
        });
      }

      sanitizedItems.push({
        productId: String(product._id),

        name: product.name,

        image: product.image || "",

        // Price frontend se nahi,
        // MongoDB product se li ja rahi hai
        price: Number(
          product.price || 0
        ),

        qty,

        selectedSize:
          item.selectedSize ||
          "Free Size",
      });
    }

    const subtotal =
      sanitizedItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.qty),
        0
      );

    const {
      coupon,
      discountAmount,
    } =
      await validateCouponForCustomer({
        couponCode,

        customerId:
          req.customer._id,

        subtotal,
      });

    const amount = Math.max(
      subtotal - discountAmount,
      0
    );

    const orderId =
      `PF${Date.now()}`;

    const order = await Order.create({
      customerId:
        req.customer._id,

      orderId,

      customer: {
        name: customer.name.trim(),

        phone:
          customer.phone.trim(),

        email:
          customer.email?.trim() ||
          "",
      },

      address: {
        house:
          address.house.trim(),

        city:
          address.city.trim(),

        state:
          address.state.trim(),

        pincode:
          address.pincode.trim(),
      },

      items: sanitizedItems,

      subtotal,

      discountAmount,

      amount,

      couponCode:
        coupon?.code || "",

      couponId:
        coupon?._id || null,

      paymentMethod:
        ["COD", "Razorpay"].includes(paymentMethod)
          ? paymentMethod
          : "COD",

      paymentStatus: "Pending",

status:
  paymentMethod === "COD"
    ? "Pending"
    : "Pending",
    });

    if (coupon) {
      coupon.usedCount =
        Number(
          coupon.usedCount || 0
        ) + 1;

      coupon.usedBy.push({
        customerId:
          req.customer._id,

        orderId:
          order._id,

        usedAt:
          new Date(),
      });

      await coupon.save();
    }

    try {
  if (
    order.paymentMethod === "COD" &&
    order.customer?.email
  ) {
    await sendEmail({
      to: order.customer.email,
      subject: `Order Placed | ${order.orderId}`,
      html: orderConfirmationTemplate(order),
    });

    console.log("COD order email sent");
  }
} catch (emailError) {
  console.error("COD email error:", emailError.message);
}

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res
      .status(
        error.statusCode || 500
      )
      .json({
        success: false,

        message:
          error.message ||
          "Order create failed",
      });
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: req.customer._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentMethod !== "Razorpay") {
      return res.status(400).json({
        success: false,
        message: "This is not an online payment order",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.amount) * 100),
      currency: "INR",
      receipt: order.orderId,
      notes: {
        mongoOrderId: String(order._id),
        customerId: String(req.customer._id),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(200).json({
      success: true,

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      keyId: process.env.RAZORPAY_KEY_ID,

      appOrder: {
        _id: order._id,
        orderId: order.orderId,
        amount: order.amount,
      },
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Razorpay order create failed",
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: req.customer._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch",
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const signatureValid =
      generatedSignature.length ===
        razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signatureValid) {
      order.paymentStatus = "Failed";
      order.paymentFailureReason =
        "Invalid payment signature";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    order.razorpayPaymentId =
      razorpay_payment_id;

    order.razorpaySignature =
      razorpay_signature;

    order.paymentStatus = "Paid";
    order.paidAt = new Date();
    order.status = "Confirmed";
    order.paymentFailureReason = "";

    await order.save();

    try {
  if (order.customer?.email) {
    await sendEmail({
      to: order.customer.email,
      subject: `Payment Successful | ${order.orderId}`,
      html: orderConfirmationTemplate(order),
    });

    console.log("Payment email sent");
  }
} catch (emailError) {
  console.error(
    "Payment email error:",
    emailError.message
  );
}

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

exports.markRazorpayPaymentFailed = async (
  req,
  res
) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      customerId: req.customer._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "Paid") {
      order.paymentStatus = "Failed";
      order.paymentFailureReason =
        String(reason || "Payment failed").slice(
          0,
          500
        );

      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Payment failure update failed",
      error: error.message,
    });
  }
};

// =====================================
// CUSTOMER ORDERS
// =====================================

exports.getCustomerOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      customerId:
        req.customer._id,
    })
      .populate(
        "couponId",
        "code discountType discountValue"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        "Customer orders fetch failed",

      error:
        error.message,
    });
  }
};

// =====================================
// CUSTOMER CANCEL ORDER
// =====================================

exports.cancelCustomerOrder = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findOne({
        _id: req.params.id,

        customerId:
          req.customer._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found",
      });
    }

    if (
      ![
        "Pending",
        "Confirmed",
      ].includes(order.status)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This order cannot be cancelled now",
      });
    }

    order.status =
      "Cancelled";

    await order.save();

    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully",

      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        "Order cancellation failed",

      error:
        error.message,
    });
  }
};

// =====================================
// ADMIN GET ALL ORDERS
// =====================================

exports.getOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "couponId",
          "code discountType discountValue"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        "Orders fetch failed",

      error:
        error.message,
    });
  }
};

// =====================================
// GET SINGLE ORDER
// =====================================

exports.getOrderById = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findOne({
        orderId:
          req.params.orderId,
      }).populate(
        "couponId",
        "code discountType discountValue"
      );

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        "Order fetch failed",

      error:
        error.message,
    });
  }
};

// =====================================
// ADMIN UPDATE ORDER STATUS
// =====================================

exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (
      !allowedStatuses.includes(
        req.body.status
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid order status",
      });
    }

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,

        {
          status:
            req.body.status,
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Order status updated",

      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        "Order update failed",

      error:
        error.message,
    });
  }
};

// =====================================
// ADMIN DELETE ORDER
// =====================================

exports.deleteOrder = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findByIdAndDelete(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        "Order delete failed",

      error:
        error.message,
    });
  }
};