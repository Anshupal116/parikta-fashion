import {
  FiShoppingBag,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";

function FloatingCartButton() {
  const {
    cartCount,
    cartTotal,
    openCart,
  } = useCart();

  if (cartCount === 0) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      className="fixed right-5 bottom-24 md:bottom-7 z-[180] bg-[#9A3F4D] text-white rounded-full shadow-2xl px-4 py-3 flex items-center gap-3 hover:bg-[#7d3140] hover:scale-105 transition"
    >
      <div className="relative">
        <FiShoppingBag size={22} />

        <span className="absolute -top-3 -right-3 w-5 h-5 bg-white text-[#9A3F4D] rounded-full flex items-center justify-center text-[10px] font-bold">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      </div>

      <div className="hidden sm:block text-left">
        <p className="text-[9px] uppercase tracking-[0.14em] opacity-80">
          View Cart
        </p>

        <p className="text-sm font-bold">
          ₹
          {cartTotal.toLocaleString("en-IN")}
        </p>
      </div>
    </button>
  );
}

export default FloatingCartButton;