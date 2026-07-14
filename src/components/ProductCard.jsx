import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ item }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productId = item._id || item.id;
  const liked = isInWishlist(productId);

  const averageRating = Number(item.averageRating || 0);
  const reviewCount = Number(item.reviewCount || 0);

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isFilled = star <= Math.round(averageRating);

      return (
        <span
          key={star}
          className={
            isFilled
              ? "text-[#C9A227]"
              : "text-[#ded4ce]"
          }
        >
          ★
        </span>
      );
    });
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-[#f7f2ee]">
        <Link to={`/product/${productId}`}>
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full aspect-[3/4] object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        <button
          type="button"
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={() =>
            toggleWishlist({
              ...item,
              id: productId,
            })
          }
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center"
        >
          <span
            className={`text-sm ${
              liked
                ? "text-[#9A3F4D]"
                : "text-[#777]"
            }`}
          >
            ♥
          </span>
        </button>

        {item.badge && (
          <span className="absolute left-3 top-3 bg-[#9A3F4D] text-white text-[10px] px-2 py-1 uppercase tracking-wider">
            {item.badge}
          </span>
        )}
      </div>

      <div className="pt-4 text-center">
        <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-[#BFA996]">
          {item.type}
        </p>

        <Link to={`/product/${productId}`}>
          <h3 className="mt-2 text-sm md:text-base font-medium text-[#3f2d28] leading-6">
            {item.name}
          </h3>
        </Link>

        {reviewCount > 0 ? (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div
              className="flex items-center gap-0.5 text-sm"
              aria-label={`${averageRating} out of 5 stars`}
            >
              {renderStars()}
            </div>

            <span className="text-xs font-semibold text-[#5B3B32]">
              {averageRating.toFixed(1)}
            </span>

            <span className="text-xs text-[#8b746b]">
              ({reviewCount})
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#8b746b] mt-2">
            No reviews yet
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[#9A3F4D] font-semibold text-sm md:text-base">
            ₹
            {Number(item.price || 0).toLocaleString(
              "en-IN"
            )}
          </span>

          {Number(item.mrp) > Number(item.price) && (
            <span className="text-gray-400 line-through text-xs">
              ₹
              {Number(item.mrp).toLocaleString(
                "en-IN"
              )}
            </span>
          )}
        </div>

        <Link to={`/product/${productId}`}>
          <button className="mt-4 text-[11px] tracking-[0.18em] uppercase text-[#9A3F4D] font-semibold">
            View Details →
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;