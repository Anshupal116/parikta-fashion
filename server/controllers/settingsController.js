const Settings = require("../models/Settings");

const SETTINGS_KEY = "store-settings";

const defaultSettings = {
  key: SETTINGS_KEY,

  store: {
    storeName: "Parikta Fashion",
    tagline: "Timeless Indian Elegance",
    logoUrl: "",
    faviconUrl: "",
    gstNumber: "",
    panNumber: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  },

  contact: {
    displayPhone: "+91 9711111111",
    whatsapp: "919711111111",
    supportEmail: "support@pariktafashion.com",
    orderEmail: "orders@pariktafashion.com",
    supportHours:
      "Monday to Saturday, 10:00 AM - 7:00 PM",
  },

  address: {
    line1: "",
    line2: "",
    city: "",
    state: "Delhi",
    pincode: "",
    country: "India",
    googleMapsUrl: "",
  },

  shipping: {
    freeShippingEnabled: true,
    freeShippingLimit: 999,
    shippingCharge: 80,
    codEnabled: true,
    codCharge: 0,
    estimatedDeliveryMin: 3,
    estimatedDeliveryMax: 7,
    returnWindowDays: 7,
  },

  social: {
    instagram: "https://instagram.com/",
    facebook: "",
    pinterest: "",
    youtube: "",
    twitter: "",
  },

  website: {
    announcementEnabled: true,
    announcementText:
      "Free shipping on orders above ₹999",
    maintenanceMode: false,
    showWhatsappButton: true,
    showNewsletter: true,
    footerCopyright: `© ${new Date().getFullYear()} Parikta Fashion. All rights reserved.`,
  },

  seo: {
    metaTitle:
      "Parikta Fashion | Premium Indian Wear",
    metaDescription:
      "Shop premium Indian ethnic wear, sarees, suits and curated fashion at Parikta Fashion.",
    metaKeywords:
      "Indian fashion, ethnic wear, sarees, suits, Parikta Fashion",
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleVerificationCode: "",
  },

  notifications: {
    orderPlacedEmail: true,
    orderStatusEmail: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
    customerReviewAlert: true,
    newsletterEnabled: true,
  },
};

const clone = (value) =>
  JSON.parse(JSON.stringify(value));

const mergeSection = (
  defaults,
  current = {},
  incoming = {}
) => ({
  ...defaults,
  ...current,
  ...incoming,
});

const normalizeString = (value = "") =>
  String(value ?? "").trim();

const normalizeEmail = (value = "") =>
  normalizeString(value).toLowerCase();

const normalizeNumber = (
  value,
  fallback = 0
) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? Math.max(parsed, 0)
    : fallback;
};

const normalizeBoolean = (
  value,
  fallback = false
) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
};

const isValidEmail = (value) =>
  !value ||
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const buildSettingsPayload = (
  incoming = {},
  current = {}
) => {
  const merged = {
    store: mergeSection(
      defaultSettings.store,
      current.store,
      incoming.store
    ),

    contact: mergeSection(
      defaultSettings.contact,
      current.contact,
      incoming.contact
    ),

    address: mergeSection(
      defaultSettings.address,
      current.address,
      incoming.address
    ),

    shipping: mergeSection(
      defaultSettings.shipping,
      current.shipping,
      incoming.shipping
    ),

    social: mergeSection(
      defaultSettings.social,
      current.social,
      incoming.social
    ),

    website: mergeSection(
      defaultSettings.website,
      current.website,
      incoming.website
    ),

    seo: mergeSection(
      defaultSettings.seo,
      current.seo,
      incoming.seo
    ),

    notifications: mergeSection(
      defaultSettings.notifications,
      current.notifications,
      incoming.notifications
    ),
  };

  return {
    store: {
      storeName: normalizeString(
        merged.store.storeName
      ),
      tagline: normalizeString(
        merged.store.tagline
      ),
      logoUrl: normalizeString(
        merged.store.logoUrl
      ),
      faviconUrl: normalizeString(
        merged.store.faviconUrl
      ),
      gstNumber: normalizeString(
        merged.store.gstNumber
      ).toUpperCase(),
      panNumber: normalizeString(
        merged.store.panNumber
      ).toUpperCase(),
      currency: ["INR", "USD", "AED"].includes(
        merged.store.currency
      )
        ? merged.store.currency
        : "INR",
      timezone: normalizeString(
        merged.store.timezone
      ) || "Asia/Kolkata",
    },

    contact: {
      displayPhone: normalizeString(
        merged.contact.displayPhone
      ),
      whatsapp: normalizeString(
        merged.contact.whatsapp
      ).replace(/[^\d]/g, ""),
      supportEmail: normalizeEmail(
        merged.contact.supportEmail
      ),
      orderEmail: normalizeEmail(
        merged.contact.orderEmail
      ),
      supportHours: normalizeString(
        merged.contact.supportHours
      ),
    },

    address: {
      line1: normalizeString(
        merged.address.line1
      ),
      line2: normalizeString(
        merged.address.line2
      ),
      city: normalizeString(
        merged.address.city
      ),
      state: normalizeString(
        merged.address.state
      ),
      pincode: normalizeString(
        merged.address.pincode
      )
        .replace(/\D/g, "")
        .slice(0, 6),
      country:
        normalizeString(
          merged.address.country
        ) || "India",
      googleMapsUrl: normalizeString(
        merged.address.googleMapsUrl
      ),
    },

    shipping: {
      freeShippingEnabled:
        normalizeBoolean(
          merged.shipping
            .freeShippingEnabled,
          true
        ),
      freeShippingLimit:
        normalizeNumber(
          merged.shipping
            .freeShippingLimit,
          999
        ),
      shippingCharge:
        normalizeNumber(
          merged.shipping.shippingCharge,
          80
        ),
      codEnabled:
        normalizeBoolean(
          merged.shipping.codEnabled,
          true
        ),
      codCharge:
        normalizeNumber(
          merged.shipping.codCharge,
          0
        ),
      estimatedDeliveryMin:
        normalizeNumber(
          merged.shipping
            .estimatedDeliveryMin,
          3
        ),
      estimatedDeliveryMax:
        normalizeNumber(
          merged.shipping
            .estimatedDeliveryMax,
          7
        ),
      returnWindowDays:
        normalizeNumber(
          merged.shipping.returnWindowDays,
          7
        ),
    },

    social: {
      instagram: normalizeString(
        merged.social.instagram
      ),
      facebook: normalizeString(
        merged.social.facebook
      ),
      pinterest: normalizeString(
        merged.social.pinterest
      ),
      youtube: normalizeString(
        merged.social.youtube
      ),
      twitter: normalizeString(
        merged.social.twitter
      ),
    },

    website: {
      announcementEnabled:
        normalizeBoolean(
          merged.website
            .announcementEnabled,
          true
        ),
      announcementText:
        normalizeString(
          merged.website
            .announcementText
        ),
      maintenanceMode:
        normalizeBoolean(
          merged.website.maintenanceMode,
          false
        ),
      showWhatsappButton:
        normalizeBoolean(
          merged.website
            .showWhatsappButton,
          true
        ),
      showNewsletter:
        normalizeBoolean(
          merged.website.showNewsletter,
          true
        ),
      footerCopyright:
        normalizeString(
          merged.website
            .footerCopyright
        ),
    },

    seo: {
      metaTitle: normalizeString(
        merged.seo.metaTitle
      ).slice(0, 70),
      metaDescription:
        normalizeString(
          merged.seo.metaDescription
        ).slice(0, 180),
      metaKeywords:
        normalizeString(
          merged.seo.metaKeywords
        ),
      googleAnalyticsId:
        normalizeString(
          merged.seo
            .googleAnalyticsId
        ),
      facebookPixelId:
        normalizeString(
          merged.seo.facebookPixelId
        ),
      googleVerificationCode:
        normalizeString(
          merged.seo
            .googleVerificationCode
        ),
    },

    notifications: {
      orderPlacedEmail:
        normalizeBoolean(
          merged.notifications
            .orderPlacedEmail,
          true
        ),
      orderStatusEmail:
        normalizeBoolean(
          merged.notifications
            .orderStatusEmail,
          true
        ),
      lowStockAlert:
        normalizeBoolean(
          merged.notifications
            .lowStockAlert,
          true
        ),
      lowStockThreshold:
        normalizeNumber(
          merged.notifications
            .lowStockThreshold,
          5
        ),
      customerReviewAlert:
        normalizeBoolean(
          merged.notifications
            .customerReviewAlert,
          true
        ),
      newsletterEnabled:
        normalizeBoolean(
          merged.notifications
            .newsletterEnabled,
          true
        ),
    },
  };
};

const validateSettings = (settings) => {
  const errors = {};

  if (!settings.store.storeName) {
    errors["store.storeName"] =
      "Store name is required";
  }

  if (
    !isValidEmail(
      settings.contact.supportEmail
    )
  ) {
    errors["contact.supportEmail"] =
      "Enter a valid support email";
  }

  if (
    !isValidEmail(
      settings.contact.orderEmail
    )
  ) {
    errors["contact.orderEmail"] =
      "Enter a valid order email";
  }

  const urls = [
    [
      "store.logoUrl",
      settings.store.logoUrl,
    ],
    [
      "store.faviconUrl",
      settings.store.faviconUrl,
    ],
    [
      "address.googleMapsUrl",
      settings.address.googleMapsUrl,
    ],
    [
      "social.instagram",
      settings.social.instagram,
    ],
    [
      "social.facebook",
      settings.social.facebook,
    ],
    [
      "social.pinterest",
      settings.social.pinterest,
    ],
    [
      "social.youtube",
      settings.social.youtube,
    ],
    [
      "social.twitter",
      settings.social.twitter,
    ],
  ];

  urls.forEach(([key, value]) => {
    if (!isValidUrl(value)) {
      errors[key] =
        "Enter a complete URL including https://";
    }
  });

  if (
    settings.address.pincode &&
    !/^\d{6}$/.test(
      settings.address.pincode
    )
  ) {
    errors["address.pincode"] =
      "Pincode must contain 6 digits";
  }

  if (
    settings.shipping
      .estimatedDeliveryMin >
    settings.shipping
      .estimatedDeliveryMax
  ) {
    errors[
      "shipping.estimatedDeliveryMax"
    ] =
      "Maximum delivery days must be greater than or equal to minimum delivery days";
  }

  return errors;
};

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({
    key: SETTINGS_KEY,
  });

  if (!settings) {
    settings = await Settings.create(
      clone(defaultSettings)
    );
  }

  return settings;
};

// ========================================
// PUBLIC SETTINGS
// GET /api/settings
// ========================================
exports.getPublicSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await getOrCreateSettings();

    return res.status(200).json({
      success: true,
      settings: {
        store: settings.store,
        contact: settings.contact,
        address: settings.address,
        shipping: settings.shipping,
        social: settings.social,
        website: settings.website,
        seo: settings.seo,
      },
    });
  } catch (error) {
    console.error(
      "Get public settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Website settings load failed",
      error: error.message,
    });
  }
};

// ========================================
// ADMIN SETTINGS
// GET /api/admin/settings
// ========================================
exports.getAdminSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await getOrCreateSettings();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "Get admin settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Admin settings load failed",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE SETTINGS
// PUT /api/admin/settings
// ========================================
exports.updateSettings = async (
  req,
  res
) => {
  try {
    const existing =
      await getOrCreateSettings();

    const normalized =
      buildSettingsPayload(
        req.body?.settings || req.body,
        existing.toObject()
      );

    const validationErrors =
      validateSettings(normalized);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please correct the settings errors",
        errors: validationErrors,
      });
    }

    Object.assign(existing, normalized);

    existing.key = SETTINGS_KEY;

    if (req.admin?._id) {
      existing.updatedBy =
        req.admin._id;
    } else if (req.user?._id) {
      existing.updatedBy =
        req.user._id;
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message:
        "Settings updated successfully",
      settings: existing,
    });
  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Settings update failed",
      error: error.message,
    });
  }
};

// ========================================
// RESET SETTINGS
// POST /api/admin/settings/reset
// ========================================
exports.resetSettings = async (
  req,
  res
) => {
  try {
    const existing =
      await getOrCreateSettings();

    const defaults = clone(
      defaultSettings
    );

    Object.assign(existing, {
      store: defaults.store,
      contact: defaults.contact,
      address: defaults.address,
      shipping: defaults.shipping,
      social: defaults.social,
      website: defaults.website,
      seo: defaults.seo,
      notifications:
        defaults.notifications,
    });

    if (req.admin?._id) {
      existing.updatedBy =
        req.admin._id;
    } else if (req.user?._id) {
      existing.updatedBy =
        req.user._id;
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message:
        "Default settings restored",
      settings: existing,
    });
  } catch (error) {
    console.error(
      "Reset settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Settings reset failed",
      error: error.message,
    });
  }
};