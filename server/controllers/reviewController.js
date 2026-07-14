const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================
// CUSTOMER: CREATE REVIEW
// =====================================

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product, rating and review comment are required",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId).select(
      "_id name isActive"
    );

    if (!product || product.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      productId,
      customerId: req.customer._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Delivered order me same product hona chahiye
    const deliveredOrder = await Order.findOne({
      customerId: req.customer._id,
      status: "Delivered",
      items: {
        $elemMatch: {
          productId: String(productId),
        },
      },
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message:
          "Only customers with a delivered order can review this product",
      });
    }

    const review = await Review.create({
      productId,
      customerId: req.customer._id,
      customerName: req.customer.name || "Parikta Customer",
      rating: numericRating,
      title: title?.trim() || "",
      comment: comment.trim(),
      verifiedPurchase: true,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully. It will appear after admin approval.",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Review submit failed",
      error: error.message,
    });
  }
};

// =====================================
// PUBLIC: PRODUCT APPROVED REVIEWS
// =====================================

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const reviews = await Review.find({
      productId,
      status: "Approved",
    })
      .select(
        "customerName rating title comment verifiedPurchase adminReply helpfulCount createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;

    const ratingSum = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number((ratingSum / totalReviews).toFixed(1))
        : 0;

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      ratingBreakdown[review.rating] += 1;
    });

    return res.status(200).json({
      success: true,
      totalReviews,
      averageRating,
      ratingBreakdown,
      reviews,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Reviews load failed",
      error: error.message,
    });
  }
};

// =====================================
// CUSTOMER: CHECK REVIEW ELIGIBILITY
// =====================================

exports.checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const existingReview = await Review.findOne({
      productId,
      customerId: req.customer._id,
    }).select("_id status rating title comment");

    if (existingReview) {
      return res.status(200).json({
        success: true,
        eligible: false,
        alreadyReviewed: true,
        message: "You have already reviewed this product",
        review: existingReview,
      });
    }

    const deliveredOrder = await Order.findOne({
      customerId: req.customer._id,
      status: "Delivered",
      items: {
        $elemMatch: {
          productId: String(productId),
        },
      },
    }).select("_id orderId");

    return res.status(200).json({
      success: true,
      eligible: Boolean(deliveredOrder),
      alreadyReviewed: false,
      message: deliveredOrder
        ? "You can review this product"
        : "Review is available after product delivery",
    });
  } catch (error) {
    console.error("Review eligibility error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check review eligibility",
      error: error.message,
    });
  }
};

// =====================================
// CUSTOMER: UPDATE OWN REVIEW
// =====================================

exports.updateMyReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    if (title !== undefined) {
      review.title = title.trim();
    }

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Review comment cannot be empty",
        });
      }

      review.comment = comment.trim();
    }

    // Edit ke baad dobara approval
    review.status = "Pending";
    review.adminReply = "";

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated and sent for approval",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Review update failed",
      error: error.message,
    });
  }
};

// =====================================
// CUSTOMER: DELETE OWN REVIEW
// =====================================

exports.deleteMyReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      customerId: req.customer._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Review delete failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: GET ALL REVIEWS
// =====================================

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("productId", "name image price")
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin reviews load failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: UPDATE REVIEW STATUS
// =====================================

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully`,
      review,
    });
  } catch (error) {
    console.error("Update review status error:", error);

    return res.status(500).json({
      success: false,
      message: "Review status update failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: REPLY TO REVIEW
// =====================================

exports.replyToReview = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply cannot be empty",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        adminReply: adminReply.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    console.error("Reply review error:", error);

    return res.status(500).json({
      success: false,
      message: "Reply add failed",
      error: error.message,
    });
  }
};

// =====================================
// ADMIN: DELETE REVIEW
// =====================================

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Review delete failed",
      error: error.message,
    });
  }
};