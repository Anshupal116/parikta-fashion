import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiHeart } from "react-icons/fi";

import { useWishlist } from "../context/WishlistContext";
import QuickViewModal from "./QuickViewModal";
import ImageSkeleton from "./ImageSkeleton";

function ProductCard({ item }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const productId = item._id || item.id;
  const liked = isInWishlist(productId);

  const averageRating = Number(item.averageRating || 0);
  const reviewCount = Number(item.reviewCount || 0);

  const price = Number(item.price || 0);
  const mrp = Number(item.mrp || 0);

  const discountPercentage =
    mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const isBestSeller =
    averageRating >= 4.8 && reviewCount >= 20;

  const isCustomerFavourite =
    !isBestSeller &&
    averageRating >= 4.5 &&
    reviewCount >= 10;

  const renderStars = () =>
    [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={
          star <= Math.round(averageRating)
            ? "text-[#C9A227]"
            : "text-[#ded4ce]"
        }
      >
        ★
      </span>
    ));

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist({
      ...item,
      id: productId,
    });
  };

  return (
    <>
      <article className="group relative bg-[#fffaf7] rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(91,59,50,0.12)]">
        <div className="relative overflow-hidden rounded-2xl bg-[#f7f2ee]">
          <Link
            to={`/product/${productId}`}
            className="relative block aspect-[3/4]"
          >
            {!imageLoaded && <ImageSkeleton />}

            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${
                item.hoverImage
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-105"
              }`}
            />

            {item.hoverImage && (
              <img
                src={item.hoverImage}
                alt={`${item.name} alternate view`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 scale-105 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
              />
            )}
          </Link>

          <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
            {isBestSeller && (
              <span className="bg-[#2f241f] text-white text-[9px] md:text-[10px] px-3 py-1.5 rounded-full uppercase tracking-[0.12em] font-bold shadow-md">
                🔥 Best Seller
              </span>
            )}

            {isCustomerFavourite && (
              <span className="bg-[#fffaf7] text-[#9A3F4D] border border-[#eadbd4] text-[9px] md:text-[10px] px-3 py-1.5 rounded-full uppercase tracking-[0.1em] font-bold shadow-md">
                ♥ Customer Favourite
              </span>
            )}

            {!isBestSeller &&
              !isCustomerFavourite &&
              item.badge && (
                <span className="bg-[#9A3F4D] text-white text-[9px] md:text-[10px] px-3 py-1.5 rounded-full uppercase tracking-[0.12em] font-bold shadow-md">
                  {item.badge}
                </span>
              )}

            {discountPercentage > 0 && (
              <span className="bg-green-700 text-white text-[9px] md:text-[10px] px-3 py-1.5 rounded-full uppercase tracking-[0.1em] font-bold shadow-md">
                {discountPercentage}% Off
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={
              liked
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              liked
                ? "bg-[#9A3F4D] text-white scale-110"
                : "bg-white/95 text-[#5B3B32] hover:bg-[#9A3F4D] hover:text-white hover:scale-110"
            }`}
          >
            <FiHeart
              size={18}
              className={
                liked ? "fill-current" : ""
              }
            />
          </button>

          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md text-[#5B3B32] py-3 rounded-xl text-[10px] md:text-xs tracking-[0.16em] uppercase font-bold flex items-center justify-center gap-2 shadow-xl transition-all duration-300 opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0"
          >
            <FiEye size={17} />
            Quick View
          </button>
        </div>

        <div className="px-3 pt-4 pb-5 text-center">
          <p className="text-[9px] md:text-[11px] tracking-[0.22em] uppercase text-[#BFA996] font-semibold">
            {item.type || item.category}
          </p>

          <Link to={`/product/${productId}`}>
            <h3 className="mt-2 text-sm md:text-base font-semibold text-[#3f2d28] leading-6 line-clamp-2 min-h-[48px] hover:text-[#9A3F4D] transition">
              {item.name}
            </h3>
          </Link>

          {reviewCount > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
              <div
                className="flex items-center gap-0.5 text-xs md:text-sm"
                aria-label={`${averageRating} out of 5 stars`}
              >
                {renderStars()}
              </div>

              <span className="text-xs font-bold text-[#5B3B32]">
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

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="text-[#9A3F4D] font-bold text-base md:text-lg">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {mrp > price && (
              <span className="text-gray-400 line-through text-xs md:text-sm">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}

            {discountPercentage > 0 && (
              <span className="text-green-700 text-[10px] md:text-xs font-bold">
                Save ₹
                {(mrp - price).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <Link
            to={`/product/${productId}`}
            className="inline-flex mt-4 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-[#9A3F4D] font-bold border-b border-transparent hover:border-[#9A3F4D] transition"
          >
            View Details →
          </Link>
        </div>
      </article>

      <QuickViewModal
        product={item}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}

export default ProductCard;