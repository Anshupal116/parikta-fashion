const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Ready-made", "Customize"],
      default: "Ready-made",
    },

    category: {
      type: String,
      enum: ["Suit", "Saree", "Kurti", "Lehenga", "Gown", "Other"],
      default: "Other",
    },

    price: {
      type: Number,
      required: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    discount: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "",
    },

    badge: {
      type: String,
      enum: ["", "New Arrival", "Best Seller", "Trending", "Limited Edition"],
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    hoverImage: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);