const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "store-settings",
      trim: true,
    },

    store: {
      storeName: {
        type: String,
        default: "Parikta Fashion",
        trim: true,
      },
      tagline: {
        type: String,
        default: "Timeless Indian Elegance",
        trim: true,
      },
      logoUrl: {
        type: String,
        default: "",
        trim: true,
      },
      faviconUrl: {
        type: String,
        default: "",
        trim: true,
      },
      gstNumber: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },
      panNumber: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },
      currency: {
        type: String,
        enum: ["INR", "USD", "AED"],
        default: "INR",
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
      },
    },

    contact: {
      displayPhone: {
        type: String,
        default: "+91 9711111111",
        trim: true,
      },
      whatsapp: {
        type: String,
        default: "919711111111",
        trim: true,
      },
      supportEmail: {
        type: String,
        default: "support@pariktafashion.com",
        trim: true,
        lowercase: true,
      },
      orderEmail: {
        type: String,
        default: "orders@pariktafashion.com",
        trim: true,
        lowercase: true,
      },
      supportHours: {
        type: String,
        default: "Monday to Saturday, 10:00 AM - 7:00 PM",
        trim: true,
      },
    },

    address: {
      line1: {
        type: String,
        default: "",
        trim: true,
      },
      line2: {
        type: String,
        default: "",
        trim: true,
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
      state: {
        type: String,
        default: "Delhi",
        trim: true,
      },
      pincode: {
        type: String,
        default: "",
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
      googleMapsUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },

    shipping: {
      freeShippingEnabled: {
        type: Boolean,
        default: true,
      },
      freeShippingLimit: {
        type: Number,
        default: 999,
        min: 0,
      },
      shippingCharge: {
        type: Number,
        default: 80,
        min: 0,
      },
      codEnabled: {
        type: Boolean,
        default: true,
      },
      codCharge: {
        type: Number,
        default: 0,
        min: 0,
      },
      estimatedDeliveryMin: {
        type: Number,
        default: 3,
        min: 0,
      },
      estimatedDeliveryMax: {
        type: Number,
        default: 7,
        min: 0,
      },
      returnWindowDays: {
        type: Number,
        default: 7,
        min: 0,
      },
    },

    social: {
      instagram: {
        type: String,
        default: "https://instagram.com/",
        trim: true,
      },
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      pinterest: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
      twitter: {
        type: String,
        default: "",
        trim: true,
      },
    },

    website: {
      announcementEnabled: {
        type: Boolean,
        default: true,
      },
      announcementText: {
        type: String,
        default: "Free shipping on orders above ₹999",
        trim: true,
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      showWhatsappButton: {
        type: Boolean,
        default: true,
      },
      showNewsletter: {
        type: Boolean,
        default: true,
      },
      footerCopyright: {
        type: String,
        default: `© ${new Date().getFullYear()} Parikta Fashion. All rights reserved.`,
        trim: true,
      },
    },

    seo: {
      metaTitle: {
        type: String,
        default: "Parikta Fashion | Premium Indian Wear",
        trim: true,
      },
      metaDescription: {
        type: String,
        default:
          "Shop premium Indian ethnic wear, sarees, suits and curated fashion at Parikta Fashion.",
        trim: true,
      },
      metaKeywords: {
        type: String,
        default:
          "Indian fashion, ethnic wear, sarees, suits, Parikta Fashion",
        trim: true,
      },
      googleAnalyticsId: {
        type: String,
        default: "",
        trim: true,
      },
      facebookPixelId: {
        type: String,
        default: "",
        trim: true,
      },
      googleVerificationCode: {
        type: String,
        default: "",
        trim: true,
      },
    },

    notifications: {
      orderPlacedEmail: {
        type: Boolean,
        default: true,
      },
      orderStatusEmail: {
        type: Boolean,
        default: true,
      },
      lowStockAlert: {
        type: Boolean,
        default: true,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0,
      },
      customerReviewAlert: {
        type: Boolean,
        default: true,
      },
      newsletterEnabled: {
        type: Boolean,
        default: true,
      },
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);