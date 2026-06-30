const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const customerAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.customer = await Customer.findById(decoded.id).select("-password");

    if (!req.customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = customerAuth;