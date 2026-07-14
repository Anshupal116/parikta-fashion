import RatingStars from "./RatingStars";

function ReviewCard({ review }) {
  const reviewDate = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <article className="bg-white border border-[#eadbd4] rounded-3xl p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FDEAE6] text-[#9A3F4D] flex items-center justify-center font-bold">
              {(review?.customerName || "C")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h3 className="font-bold text-[#5B3B32]">
                {review?.customerName || "Parikta Customer"}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {review?.verifiedPurchase && (
                  <span className="text-[11px] bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✓ Verified Purchase
                  </span>
                )}

                {reviewDate && (
                  <span className="text-xs text-[#8b746b]">
                    {reviewDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <RatingStars
              value={Number(review?.rating || 0)}
              readOnly
              size={20}
            />
          </div>
        </div>
      </div>

      {review?.title && (
        <h4 className="text-lg font-bold text-[#5B3B32] mt-5">
          {review.title}
        </h4>
      )}

      <p className="text-[#6d554d] leading-7 mt-3">
        {review?.comment}
      </p>

      {review?.adminReply && (
        <div className="mt-5 bg-[#fff7f3] border-l-4 border-[#9A3F4D] rounded-r-2xl p-4">
          <p className="text-xs uppercase tracking-[0.16em] font-bold text-[#9A3F4D]">
            Parikta Fashion Reply
          </p>

          <p className="text-[#5B3B32] leading-7 mt-2">
            {review.adminReply}
          </p>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-[#eadbd4] flex items-center justify-between">
        <p className="text-xs text-[#8b746b]">
          Was this review helpful?
        </p>

        <button
          type="button"
          disabled
          className="border border-[#eadbd4] text-[#5B3B32] px-4 py-2 rounded-full text-sm disabled:opacity-60"
        >
          👍 Helpful ({review?.helpfulCount || 0})
        </button>
      </div>
    </article>
  );
}

export default ReviewCard;