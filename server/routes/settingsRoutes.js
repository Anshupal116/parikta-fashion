const express = require("express");

const {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
  resetSettings,
} = require("../controllers/settingsController");

const adminAuth = require("../middleware/adminAuth");

const publicSettingsRouter = express.Router();
const adminSettingsRouter = express.Router();

/*
|--------------------------------------------------------------------------
| Public Website Settings
|--------------------------------------------------------------------------
| Mounted in server.js at:
| app.use("/api/settings", publicSettingsRouter);
|
| Endpoint:
| GET /api/settings
*/

publicSettingsRouter.get(
  "/",
  getPublicSettings
);

/*
|--------------------------------------------------------------------------
| Admin Settings
|--------------------------------------------------------------------------
| Mounted in server.js at:
| app.use("/api/admin", adminSettingsRouter);
|
| Endpoints:
| GET  /api/admin/settings
| PUT  /api/admin/settings
| POST /api/admin/settings/reset
*/

adminSettingsRouter.get(
  "/settings",
  adminAuth,
  getAdminSettings
);

adminSettingsRouter.put(
  "/settings",
  adminAuth,
  updateSettings
);

adminSettingsRouter.post(
  "/settings/reset",
  adminAuth,
  resetSettings
);

module.exports = {
  publicSettingsRouter,
  adminSettingsRouter,
};