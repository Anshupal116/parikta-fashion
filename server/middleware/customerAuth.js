const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const customerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const customer = await Customer.findById(
      decoded.id
    ).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    req.customer = customer;

    next();
  } catch (error) {
    console.error("Customer auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = customerAuth;