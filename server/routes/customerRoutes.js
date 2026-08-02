const express = require("express");

const {
  sendOtp,
  verifyOtp,
  completeProfile,
  getAllCustomers,
  lookupPincode,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  selectCheckoutAddress,
  getCheckoutAddress,
} = require("../controllers/customerController");

const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Customer Authentication
|--------------------------------------------------------------------------
*/

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/complete-profile", completeProfile);

/*
|--------------------------------------------------------------------------
| Pincode Lookup
|--------------------------------------------------------------------------
| Public route used by checkout address form.
| Example: GET /api/customers/pincode/110058
*/

router.get("/pincode/:pincode", lookupPincode);

/*
|--------------------------------------------------------------------------
| Customer Address Management
|--------------------------------------------------------------------------
| All routes below require a valid customer Bearer token.
*/

router.get(
  "/addresses",
  customerAuth,
  getAddresses
);

router.post(
  "/addresses",
  customerAuth,
  addAddress
);

router.put(
  "/addresses/:addressId",
  customerAuth,
  updateAddress
);

router.delete(
  "/addresses/:addressId",
  customerAuth,
  deleteAddress
);

router.patch(
  "/addresses/:addressId/default",
  customerAuth,
  setDefaultAddress
);

/*
|--------------------------------------------------------------------------
| Checkout Address
|--------------------------------------------------------------------------
*/

router.get(
  "/checkout-address",
  customerAuth,
  getCheckoutAddress
);

router.patch(
  "/checkout-address/:addressId",
  customerAuth,
  selectCheckoutAddress
);

/*
|--------------------------------------------------------------------------
| Admin Customer Routes
|--------------------------------------------------------------------------
| Add your existing admin middleware here if these routes are protected.
*/

router.get("/", getAllCustomers);
router.get("/admin/all", getAllCustomers);

module.exports = router;