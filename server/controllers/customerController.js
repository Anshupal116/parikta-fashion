const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const DEVELOPMENT_OTP = "123456";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const normalizePhone = (phone = "") =>
  String(phone).replace(/\D/g, "").slice(-10);

const customerResponse = (customer) => ({
  _id: customer._id,
  name: customer.name || "",
  phone: customer.phone,
  email: customer.email || "",
  isProfileComplete: Boolean(customer.isProfileComplete),
  isVerified: Boolean(customer.isVerified),
});

// ========================================
// SEND OTP - DEVELOPMENT MODE
// OTP is always 123456
// ========================================
exports.sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    const customer = await Customer.findOne({ phone });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      phone,
      isExistingCustomer: Boolean(customer),
      // Remove this field when MSG91 is connected.
      developmentOtp:
        process.env.NODE_ENV === "production"
          ? undefined
          : DEVELOPMENT_OTP,
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP send failed",
      error: error.message,
    });
  }
};

// ========================================
// VERIFY OTP
// Existing customer => login
// New customer => ask for profile
// ========================================
exports.verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    if (otp !== DEVELOPMENT_OTP) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(200).json({
        success: true,
        isNewCustomer: true,
        requiresProfile: true,
        phone,
        message: "OTP verified. Please complete your profile.",
      });
    }

    customer.isVerified = true;
    await customer.save();

    return res.status(200).json({
      success: true,
      isNewCustomer: false,
      requiresProfile: !customer.isProfileComplete,
      token: generateToken(customer._id),
      customer: customerResponse(customer),
      message: "Login successful",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// ========================================
// COMPLETE PROFILE / SIGNUP
// ========================================
exports.completeProfile = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    if (otp !== DEVELOPMENT_OTP) {
      return res.status(401).json({
        success: false,
        message: "OTP verification expired or invalid",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter your full name",
      });
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (email) {
      const emailExists = await Customer.findOne({
        email,
        phone: { $ne: phone },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "This email is already linked to another account",
        });
      }
    }

    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = await Customer.create({
        name,
        phone,
        email: email || undefined,
        isProfileComplete: true,
        isVerified: true,
      });
    } else {
      customer.name = name;
      customer.email = email || undefined;
      customer.isProfileComplete = true;
      customer.isVerified = true;
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Account created successfully",
      token: generateToken(customer._id),
      customer: customerResponse(customer),
    });
  } catch (error) {
    console.error("Complete profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Profile completion failed",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL CUSTOMERS WITH ORDER STATS
// ========================================
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .lean();

    const orders = await Order.find()
      .select(
        "customer customerId amount status createdAt orderId"
      )
      .lean();

    const customersWithStats = customers.map((customer) => {
      const currentCustomerId = customer._id.toString();

      const customerOrders = orders.filter((order) => {
        let orderCustomerId = null;

        if (
          order.customer &&
          typeof order.customer !== "object"
        ) {
          orderCustomerId = order.customer.toString();
        }

        if (
          order.customer &&
          typeof order.customer === "object"
        ) {
          orderCustomerId =
            order.customer._id?.toString() ||
            order.customer.id?.toString() ||
            null;
        }

        if (!orderCustomerId && order.customerId) {
          orderCustomerId = order.customerId.toString();
        }

        const sameId =
          orderCustomerId === currentCustomerId;

        const samePhone =
          order.customer?.phone &&
          customer.phone &&
          String(order.customer.phone).trim() ===
            String(customer.phone).trim();

        const sameEmail =
          order.customer?.email &&
          customer.email &&
          String(order.customer.email)
            .trim()
            .toLowerCase() ===
            String(customer.email)
              .trim()
              .toLowerCase();

        return sameId || samePhone || sameEmail;
      });

      const nonCancelledOrders = customerOrders.filter(
        (order) => order.status !== "Cancelled"
      );

      const totalSpend = nonCancelledOrders.reduce(
        (sum, order) =>
          sum + Number(order.amount || 0),
        0
      );

      const lastOrder =
        customerOrders
          .map((order) => order.createdAt)
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b).getTime() -
              new Date(a).getTime()
          )[0] || null;

      return {
        ...customer,
        totalOrders: customerOrders.length,
        activeOrders: customerOrders.filter(
          (order) =>
            !["Cancelled", "Delivered"].includes(
              order.status
            )
        ).length,
        deliveredOrders: customerOrders.filter(
          (order) => order.status === "Delivered"
        ).length,
        cancelledOrders: customerOrders.filter(
          (order) => order.status === "Cancelled"
        ).length,
        totalSpend,
        lastOrder,
      };
    });

    return res.status(200).json({
      success: true,
      count: customersWithStats.length,
      customers: customersWithStats,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Customers load failed",
      error: error.message,
    });
  }
};
