import RatingStars from "./RatingStars";

function ReviewSummary({
  averageRating = 0,
  totalReviews = 0,
  ratingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
}) {
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;

    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eadbd4] p-6">
      <h2 className="text-2xl font-bold text-[#5B3B32] mb-6">
        Customer Reviews
      </h2>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">

        {/* Left */}

        <div className="text-center">

          <h3 className="text-6xl font-bold text-[#9A3F4D]">
            {averageRating.toFixed(1)}
          </h3>

          <div className="flex justify-center mt-2">
            <RatingStars
              value={averageRating}
              readOnly
              size={28}
            />
          </div>

          <p className="mt-3 text-[#6b5b54]">
            Based on {totalReviews} review
            {totalReviews !== 1 && "s"}
          </p>

        </div>

        {/* Right */}

        <div className="space-y-4">

          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className="grid grid-cols-[50px_1fr_45px] items-center gap-4"
            >
              <span className="font-semibold text-[#5B3B32]">
                {star} ★
              </span>

              <div className="h-3 bg-[#f3ece8] rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#C9A227] rounded-full transition-all duration-500"
                  style={{
                    width: `${getPercentage(
                      ratingBreakdown[star]
                    )}%`,
                  }}
                />

              </div>

              <span className="text-sm text-[#5B3B32] text-right">
                {ratingBreakdown[star]}
              </span>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default ReviewSummary;