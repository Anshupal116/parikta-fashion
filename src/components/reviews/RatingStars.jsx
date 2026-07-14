import { useState } from "react";

function RatingStars({
  value = 0,
  onChange,
  size = 24,
  readOnly = false,
  showValue = false,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const activeValue = hoverValue || value;

  const handleClick = (rating) => {
    if (readOnly || !onChange) return;
    onChange(rating);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isActive = rating <= activeValue;

          return (
            <button
              key={rating}
              type="button"
              disabled={readOnly}
              aria-label={`${rating} star rating`}
              onMouseEnter={() => {
                if (!readOnly) {
                  setHoverValue(rating);
                }
              }}
              onMouseLeave={() => {
                if (!readOnly) {
                  setHoverValue(0);
                }
              }}
              onClick={() => handleClick(rating)}
              className={`leading-none transition-transform ${
                readOnly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-110"
              }`}
              style={{ fontSize: `${size}px` }}
            >
              <span
                className={
                  isActive
                    ? "text-[#C9A227]"
                    : "text-[#ded4ce]"
                }
              >
                ★
              </span>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-[#5B3B32]">
          {Number(value || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default RatingStars;