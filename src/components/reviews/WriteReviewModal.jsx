import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

import RatingStars from "./RatingStars";
import {
  createReview,
  updateReview,
} from "../../services/reviewService";

function WriteReviewModal({
  open,
  onClose,
  productId,
  existingReview = null,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(existingReview?._id);

  useEffect(() => {
    if (!open) return;

    setRating(Number(existingReview?.rating || 0));
    setTitle(existingReview?.title || "");
    setComment(existingReview?.comment || "");
  }, [open, existingReview]);

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
  };

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating) {
      alert("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      alert("Please write your review");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      };

      const response = isEditMode
        ? await updateReview(existingReview._id, {
            rating,
            title: title.trim(),
            comment: comment.trim(),
          })
        : await createReview(payload);

      if (response.success) {
        alert(
          response.message ||
            (isEditMode
              ? "Review updated successfully"
              : "Review submitted successfully")
        );

        resetForm();
        onClose();

        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        alert(response.message || "Review submit failed");
      }
    } catch (error) {
      console.error("Review submit error:", error);

      alert(
        error.response?.data?.message ||
          "Review submit failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#fffaf7] rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eadbd4]">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#BFA996]">
              Customer Review
            </p>

            <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
              {isEditMode ? "Edit Your Review" : "Write A Review"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="w-10 h-10 rounded-full bg-[#FDEAE6] text-[#5B3B32] flex items-center justify-center disabled:opacity-50"
          >
            <FiX size={21} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-[#5B3B32] mb-3">
              Your Rating
            </label>

            <RatingStars
              value={rating}
              onChange={setRating}
              size={36}
            />

            <p className="text-xs text-[#8b746b] mt-2">
              Select between 1 and 5 stars.
            </p>
          </div>

          <div>
            <label
              htmlFor="review-title"
              className="block text-sm font-bold text-[#5B3B32] mb-2"
            >
              Review Title
            </label>

            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              maxLength={100}
              placeholder="Example: Beautiful fabric and perfect fitting"
              className="w-full border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
            />

            <p className="text-right text-xs text-[#8b746b] mt-1">
              {title.length}/100
            </p>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-sm font-bold text-[#5B3B32] mb-2"
            >
              Your Review
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              maxLength={1500}
              rows={6}
              placeholder="Tell other customers about fabric, fitting, quality and your overall experience."
              className="w-full border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none resize-none focus:border-[#9A3F4D]"
            />

            <p className="text-right text-xs text-[#8b746b] mt-1">
              {comment.length}/1500
            </p>
          </div>

          <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-4">
            <p className="text-sm text-[#5B3B32] leading-6">
              Your review will appear publicly after admin approval.
              Verified purchase status is checked automatically.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="border border-[#9A3F4D] text-[#9A3F4D] px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#9A3F4D] text-white px-7 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Submitting..."
                : isEditMode
                  ? "Update Review"
                  : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteReviewModal;