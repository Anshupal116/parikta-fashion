const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const admin = require("../config/firebaseAdmin");

const DEVELOPMENT_OTP = "123456";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const normalizePhone = (phone = "") =>
  String(phone).replace(/\D/g, "").slice(-10);

const normalizeAddress = (source = {}) => ({
  type: ["Home", "Office", "Other"].includes(source.type)
    ? source.type
    : "Home",

  name: String(source.name || "").trim(),

  phone: normalizePhone(source.phone),

  email: String(source.email || "")
    .trim()
    .toLowerCase(),

  house: String(source.house || "").trim(),

  area: String(source.area || "").trim(),

  landmark: String(source.landmark || "").trim(),

  city: String(source.city || "").trim(),

  state: String(source.state || "").trim(),

  pincode: String(source.pincode || "")
    .replace(/\D/g, "")
    .slice(0, 6),

  isDefault: Boolean(source.isDefault),
});

const validateAddress = (address) => {
  if (address.name.length < 2) {
    return "Please enter a valid full name";
  }

  if (!/^[6-9]\d{9}$/.test(address.phone)) {
    return "Please enter a valid 10-digit mobile number";
  }

  if (
    address.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)
  ) {
    return "Please enter a valid email address";
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    return "Please enter a valid 6-digit pincode";
  }

  if (!address.house) {
    return "House / flat details are required";
  }

  if (!address.area) {
    return "Area / locality is required";
  }

  if (!address.city) {
    return "City is required";
  }

  if (!address.state) {
    return "State is required";
  }

  return "";
};

const getSelectedAddress = (customer) => {
  if (!customer?.addresses?.length) {
    return null;
  }

  const selectedAddress =
    customer.selectedCheckoutAddress
      ? customer.addresses.id(
          customer.selectedCheckoutAddress
        )
      : null;

  return (
    selectedAddress ||
    customer.addresses.find(
      (address) => address.isDefault
    ) ||
    customer.addresses[0]
  );
};

const customerResponse = (customer) => ({
  _id: customer._id,
  name: customer.name || "",
  phone: customer.phone,
  email: customer.email || "",
  isProfileComplete: Boolean(
    customer.isProfileComplete
  ),
  isVerified: Boolean(customer.isVerified),
  selectedCheckoutAddress:
    customer.selectedCheckoutAddress || null,
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
        message:
          "Please enter a valid 10-digit mobile number",
      });
    }

    const customer = await Customer.findOne({
      phone,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      phone,
      isExistingCustomer: Boolean(customer),
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

    const otp = String(
      req.body.otp || ""
    ).trim();

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

    const customer = await Customer.findOne({
      phone,
    });

    if (!customer) {
      return res.status(200).json({
        success: true,
        isNewCustomer: true,
        requiresProfile: true,
        phone,
        message:
          "OTP verified. Please complete your profile.",
      });
    }

    customer.isVerified = true;

    await customer.save();

    return res.status(200).json({
      success: true,
      isNewCustomer: false,
      requiresProfile:
        !customer.isProfileComplete,
      token: generateToken(customer._id),
      customer: customerResponse(customer),
      message: "Login successful",
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "OTP verification failed",
      error: error.message,
    });
  }
};

// ========================================
// COMPLETE PROFILE / SIGNUP
// ========================================
exports.completeProfile = async (
  req,
  res
) => {
  try {
    const phone = normalizePhone(
      req.body.phone
    );

    const name = String(
      req.body.name || ""
    ).trim();

    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const otp = String(
      req.body.otp || ""
    ).trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mobile number",
      });
    }

    if (otp !== DEVELOPMENT_OTP) {
      return res.status(401).json({
        success: false,
        message:
          "OTP verification expired or invalid",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your full name",
      });
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address",
      });
    }

    if (email) {
      const emailExists =
        await Customer.findOne({
          email,
          phone: { $ne: phone },
        });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already linked to another account",
        });
      }
    }

    let customer =
      await Customer.findOne({ phone });

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
      customer.email =
        email || undefined;
      customer.isProfileComplete = true;
      customer.isVerified = true;

      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "Account created successfully",
      token: generateToken(customer._id),
      customer:
        customerResponse(customer),
    });
  } catch (error) {
    console.error(
      "Complete profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Profile completion failed",
      error: error.message,
    });
  }
};

exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID Token is required",
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    const phone = decoded.phone_number.replace("+91", "");

    let customer = await Customer.findOne({ phone });

    // New Customer
    if (!customer) {
      return res.status(200).json({
        success: true,
        isNewCustomer: true,
        requiresProfile: true,
        phone,
      });
    }

    customer.isVerified = true;
    await customer.save();

    const token = generateToken(customer._id);

    return res.status(200).json({
      success: true,
      isNewCustomer: false,
      requiresProfile: !customer.isProfileComplete,
      token,
      customer: customerResponse(customer),
      message: "Login successful",
    });

  } catch (error) {
    console.error("Firebase Login Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid Firebase Token",
    });
  }
};

// ========================================
// PINCODE LOOKUP
// ========================================
exports.lookupPincode = async (
  req,
  res
) => {
  try {
    const pincode = String(
      req.params.pincode || ""
    )
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid 6-digit pincode required",
      });
    }

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );

    const data = await response.json();

    const result = Array.isArray(data)
      ? data[0]
      : null;

    const postOffices =
      result?.PostOffice || [];

    if (
      !response.ok ||
      result?.Status !== "Success" ||
      postOffices.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Pincode details not found",
      });
    }

    const firstPostOffice =
      postOffices[0];

    return res.status(200).json({
      success: true,
      pincode,
      city:
        firstPostOffice.District ||
        firstPostOffice.Division ||
        firstPostOffice.Block ||
        firstPostOffice.Name ||
        "",
      state:
        firstPostOffice.State || "",
      postOffices: postOffices.map(
        (office) => ({
          name: office.Name,
          district: office.District,
          division: office.Division,
          block: office.Block,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Pincode lookup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Pincode lookup failed",
      error: error.message,
    });
  }
};

// ========================================
// GET CUSTOMER ADDRESSES
// ========================================
exports.getAddresses = async (
  req,
  res
) => {
  try {
    const customer =
      await Customer.findById(
        req.customer._id
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    const selectedAddress =
      getSelectedAddress(customer);

    return res.status(200).json({
      success: true,
      addresses:
        customer.addresses || [],
      selectedCheckoutAddress:
        selectedAddress || null,
      selectedCheckoutAddressId:
        selectedAddress?._id || null,
    });
  } catch (error) {
    console.error(
      "Get addresses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Addresses load failed",
      error: error.message,
    });
  }
};

// ========================================
// ADD ADDRESS
// ========================================
exports.addAddress = async (
  req,
  res
) => {
  try {
    const customer =
      await Customer.findById(
        req.customer._id
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    const addressData =
      normalizeAddress(req.body);

    const validationError =
      validateAddress(addressData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message:
          validationError,
      });
    }

    const shouldBeDefault =
      addressData.isDefault ||
      customer.addresses.length === 0;

    if (shouldBeDefault) {
      customer.addresses.forEach(
        (address) => {
          address.isDefault = false;
        }
      );
    }

    customer.addresses.push({
      ...addressData,
      isDefault: shouldBeDefault,
    });

    const addedAddress =
      customer.addresses[
        customer.addresses.length - 1
      ];

    customer.selectedCheckoutAddress =
      addedAddress._id;

    await customer.save();

    return res.status(201).json({
      success: true,
      message:
        "Address added successfully",
      address: addedAddress,
      addresses:
        customer.addresses,
      selectedCheckoutAddress:
        addedAddress,
    });
  } catch (error) {
    console.error(
      "Add address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Address add failed",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE ADDRESS
// ========================================
exports.updateAddress = async (
  req,
  res
) => {
  try {
    const customer =
      await Customer.findById(
        req.customer._id
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    const address =
      customer.addresses.id(
        req.params.addressId
      );

    if (!address) {
      return res.status(404).json({
        success: false,
        message:
          "Address not found",
      });
    }

    const addressData =
      normalizeAddress(req.body);

    const validationError =
      validateAddress(addressData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message:
          validationError,
      });
    }

    if (addressData.isDefault) {
      customer.addresses.forEach(
        (item) => {
          item.isDefault =
            item._id.toString() ===
            address._id.toString();
        }
      );
    }

    Object.assign(
      address,
      addressData
    );

    const hasDefaultAddress =
      customer.addresses.some(
        (item) => item.isDefault
      );

    if (!hasDefaultAddress) {
      address.isDefault = true;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Address updated successfully",
      address,
      addresses:
        customer.addresses,
      selectedCheckoutAddress:
        getSelectedAddress(customer),
    });
  } catch (error) {
    console.error(
      "Update address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Address update failed",
      error: error.message,
    });
  }
};

// ========================================
// DELETE ADDRESS
// ========================================
exports.deleteAddress = async (
  req,
  res
) => {
  try {
    const customer =
      await Customer.findById(
        req.customer._id
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    const address =
      customer.addresses.id(
        req.params.addressId
      );

    if (!address) {
      return res.status(404).json({
        success: false,
        message:
          "Address not found",
      });
    }

    const deletedAddressId =
      address._id.toString();

    const wasDefault =
      Boolean(address.isDefault);

    address.deleteOne();

    if (
      customer
        .selectedCheckoutAddress
        ?.toString() ===
      deletedAddressId
    ) {
      customer.selectedCheckoutAddress =
        null;
    }

    if (
      wasDefault &&
      customer.addresses.length > 0
    ) {
      customer.addresses[0].isDefault =
        true;
    }

    if (
      !customer.selectedCheckoutAddress &&
      customer.addresses.length > 0
    ) {
      const nextAddress =
        customer.addresses.find(
          (item) => item.isDefault
        ) ||
        customer.addresses[0];

      customer.selectedCheckoutAddress =
        nextAddress._id;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Address deleted successfully",
      addresses:
        customer.addresses,
      selectedCheckoutAddress:
        getSelectedAddress(customer),
    });
  } catch (error) {
    console.error(
      "Delete address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Address delete failed",
      error: error.message,
    });
  }
};

// ========================================
// SET DEFAULT ADDRESS
// ========================================
exports.setDefaultAddress = async (
  req,
  res
) => {
  try {
    const customer =
      await Customer.findById(
        req.customer._id
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    const address =
      customer.addresses.id(
        req.params.addressId
      );

    if (!address) {
      return res.status(404).json({
        success: false,
        message:
          "Address not found",
      });
    }

    customer.addresses.forEach(
      (item) => {
        item.isDefault =
          item._id.toString() ===
          address._id.toString();
      }
    );

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Default address updated",
      address,
      addresses:
        customer.addresses,
    });
  } catch (error) {
    console.error(
      "Set default address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Default address update failed",
      error: error.message,
    });
  }
};

// ========================================
// SELECT CHECKOUT ADDRESS
// ========================================
exports.selectCheckoutAddress =
  async (req, res) => {
    try {
      const customer =
        await Customer.findById(
          req.customer._id
        );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found",
        });
      }

      const address =
        customer.addresses.id(
          req.params.addressId
        );

      if (!address) {
        return res.status(404).json({
          success: false,
          message:
            "Address not found",
        });
      }

      customer.selectedCheckoutAddress =
        address._id;

      await customer.save();

      return res.status(200).json({
        success: true,
        message:
          "Checkout address selected",
        selectedCheckoutAddress:
          address,
      });
    } catch (error) {
      console.error(
        "Select checkout address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Checkout address selection failed",
        error: error.message,
      });
    }
  };

// ========================================
// GET SELECTED CHECKOUT ADDRESS
// ========================================
exports.getCheckoutAddress =
  async (req, res) => {
    try {
      const customer =
        await Customer.findById(
          req.customer._id
        );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found",
        });
      }

      const address =
        getSelectedAddress(customer);

      if (!address) {
        return res.status(404).json({
          success: false,
          message:
            "No checkout address selected",
        });
      }

      return res.status(200).json({
        success: true,
        selectedCheckoutAddress:
          address,
      });
    } catch (error) {
      console.error(
        "Get checkout address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Checkout address load failed",
        error: error.message,
      });
    }
  };

// ========================================
// GET ALL CUSTOMERS WITH ORDER STATS
// ========================================
exports.getAllCustomers = async (
  req,
  res
) => {
  try {
    const customers =
      await Customer.find()
        .sort({ createdAt: -1 })
        .lean();

    const orders = await Order.find()
      .select(
        "customer customerId amount status createdAt orderId"
      )
      .lean();

    const customersWithStats =
      customers.map((customer) => {
        const currentCustomerId =
          customer._id.toString();

        const customerOrders =
          orders.filter((order) => {
            let orderCustomerId =
              null;

            if (
              order.customer &&
              typeof order.customer !==
                "object"
            ) {
              orderCustomerId =
                order.customer.toString();
            }

            if (
              order.customer &&
              typeof order.customer ===
                "object"
            ) {
              orderCustomerId =
                order.customer._id?.toString() ||
                order.customer.id?.toString() ||
                null;
            }

            if (
              !orderCustomerId &&
              order.customerId
            ) {
              orderCustomerId =
                order.customerId.toString();
            }

            const sameId =
              orderCustomerId ===
              currentCustomerId;

            const samePhone =
              order.customer?.phone &&
              customer.phone &&
              String(
                order.customer.phone
              ).trim() ===
                String(
                  customer.phone
                ).trim();

            const sameEmail =
              order.customer?.email &&
              customer.email &&
              String(
                order.customer.email
              )
                .trim()
                .toLowerCase() ===
                String(
                  customer.email
                )
                  .trim()
                  .toLowerCase();

            return (
              sameId ||
              samePhone ||
              sameEmail
            );
          });

        const nonCancelledOrders =
          customerOrders.filter(
            (order) =>
              order.status !==
              "Cancelled"
          );

        const totalSpend =
          nonCancelledOrders.reduce(
            (sum, order) =>
              sum +
              Number(
                order.amount || 0
              ),
            0
          );

        const lastOrder =
          customerOrders
            .map(
              (order) =>
                order.createdAt
            )
            .filter(Boolean)
            .sort(
              (a, b) =>
                new Date(
                  b
                ).getTime() -
                new Date(
                  a
                ).getTime()
            )[0] || null;

        return {
          ...customer,
          totalOrders:
            customerOrders.length,
          activeOrders:
            customerOrders.filter(
              (order) =>
                ![
                  "Cancelled",
                  "Delivered",
                ].includes(
                  order.status
                )
            ).length,
          deliveredOrders:
            customerOrders.filter(
              (order) =>
                order.status ===
                "Delivered"
            ).length,
          cancelledOrders:
            customerOrders.filter(
              (order) =>
                order.status ===
                "Cancelled"
            ).length,
          totalSpend,
          lastOrder,
        };
      });

    return res.status(200).json({
      success: true,
      count:
        customersWithStats.length,
      customers:
        customersWithStats,
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Customers load failed",
      error: error.message,
    });
  }
};