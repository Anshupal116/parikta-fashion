const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

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

    res.status(201).json({
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
    res.status(500).json({
      success: false,
      message: "Register failed",
      error: error.message,
    });
  }
};

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

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const orders = await Order.find()
  .select("customer customerId amount status createdAt")
  .lean();

const customersWithStats = customers.map((customer) => {
  const customerId = customer._id.toString();

  const customerOrders = orders.filter((order) => {
    const orderCustomerId =
      order.customerId?.toString() ||
      order.customer?._id?.toString() ||
      order.customer?.id?.toString() ||
      (typeof order.customer === "string"
        ? order.customer
        : null);

    const sameId = orderCustomerId === customerId;

    const samePhone =
      order.customer?.phone &&
      customer.phone &&
      String(order.customer.phone) === String(customer.phone);

    const sameEmail =
      order.customer?.email &&
      customer.email &&
      order.customer.email.toLowerCase().trim() ===
        customer.email.toLowerCase().trim();

    return sameId || samePhone || sameEmail;
  });

  const validOrders = customerOrders.filter(
    (order) => order.status !== "Cancelled"
  );

  const totalSpend = validOrders.reduce(
    (sum, order) => sum + Number(order.amount || 0),
    0
  );

  const lastOrder = customerOrders
    .map((order) => order.createdAt)
    .filter(Boolean)
    .sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )[0] || null;

  return {
    ...customer,
    totalOrders: customerOrders.length,
    totalSpend,
    lastOrder,
  };
});

exports.getAllCustomers = getAllCustomers;