const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ===============================
// REGISTER CUSTOMER
// ===============================

exports.registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const exists = await Customer.findOne({
      $or: [{ phone }, { email }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Register successful",
      token: generateToken(customer._id),
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Register failed",
      error: error.message,
    });
  }
};

// ===============================
// LOGIN CUSTOMER
// ===============================

exports.loginCustomer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(customer._id),
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL CUSTOMERS WITH ORDER STATS
// ===============================

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
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

        // Agar order.customer direct ObjectId hai
        if (
          order.customer &&
          typeof order.customer !== "object"
        ) {
          orderCustomerId = order.customer.toString();
        }

        // Agar order.customer object hai
        if (
          order.customer &&
          typeof order.customer === "object"
        ) {
          orderCustomerId =
            order.customer._id?.toString() ||
            order.customer.id?.toString() ||
            null;
        }

        // Agar separate customerId field hai
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