import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ item, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(item.id);

  return (
    <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 duration-300 relative group">
      {item.badge && (
        <span className="absolute top-4 left-4 z-10 bg-[#9A3F4D] text-white text-xs px-3 py-1 rounded-full font-semibold">
          {item.badge}
        </span>
      )}

      <button
        onClick={() => toggleWishlist(item)}
        className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full shadow flex items-center justify-center text-xl ${
          liked ? "bg-[#9A3F4D] text-white" : "bg-white text-[#5B3B32]"
        }`}
      >
        ♥
      </button>

      <div className="relative">
        <Link to={`/product/${item.id}`}>
          <img
            src={item.image}
            alt={item.name}
            className="h-80 w-full object-cover"
          />
        </Link>

        {onQuickView && (
          <button
            onClick={onQuickView}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#9A3F4D] px-6 py-2 rounded-full font-bold shadow opacity-0 group-hover:opacity-100 duration-300"
          >
            Quick View
          </button>
        )}
      </div>

      <div className="p-5">
        <span className="text-xs bg-[#FDEAE6] text-[#9A3F4D] px-3 py-1 rounded-full">
          {item.type}
        </span>

        <h3 className="heading-font text-2xl text-[#5B3B32] mt-3">
          {item.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[#9A3F4D] font-bold text-lg">
            ₹{item.price}
          </span>
          <span className="text-gray-400 line-through">₹{item.mrp}</span>
          <span className="text-green-600 text-sm font-semibold">
            {item.discount}
          </span>
        </div>

        <Link to={`/product/${item.id}`}>
          <button className="mt-4 w-full bg-[#9A3F4D] text-white py-3 rounded-full font-semibold hover:bg-[#7d3140]">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;