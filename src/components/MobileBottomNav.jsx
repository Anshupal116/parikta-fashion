import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function MobileBottomNav() {
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Home", icon: "⌂", path: "/" },
    { label: "Shop", icon: "◈", path: "/products" },
    { label: "Custom", icon: "✂", path: "/customize" },
    { label: "Wishlist", icon: "♡", path: "/wishlist", count: wishlistCount },
    { label: "Bag", icon: "👜", path: "/cart", count: cartCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fffaf7] border-t border-[#eadbd4] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide ${
              isActive(item.path) ? "text-[#9A3F4D]" : "text-[#6d554d]"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>

            <span>{item.label}</span>

            {item.count > 0 && (
              <span className="absolute top-2 right-5 bg-[#9A3F4D] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {item.count}
              </span>
            )}

            {isActive(item.path) && (
              <span className="absolute top-0 w-8 h-[2px] bg-[#9A3F4D] rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileBottomNav;