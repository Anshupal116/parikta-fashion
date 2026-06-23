import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiSearch, FiHeart, FiShoppingBag, FiX } from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import Container from "./Container";
import AnnouncementBar from "./AnnouncementBar";
import SearchOverlay from "./SearchOverlay";
import MiniCartDrawer from "./MiniCartDrawer";

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />

      <nav className="sticky top-0 z-50 bg-[#fffaf7]/75 backdrop-blur-xl border-b border-[#eadbd4]/70 shadow-sm">
        <Container>
          <div className="h-20 md:h-24 flex items-center justify-between gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-[#5B3B32]"
            >
              {menuOpen ? <FiX size={25} /> : <FiMenu size={25} />}
            </button>

            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Collection</Link></li>
              <li><Link to="/lookbook">Lookbook</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>

            <Link to="/" className="text-center leading-none">
              <div className="logo-font text-5xl md:text-6xl text-[#9A3F4D]">
                Parikta
              </div>
              <div className="tracking-[0.45em] text-[10px] md:text-xs text-[#BFA996] font-semibold">
                FASHION
              </div>
            </Link>

            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li><Link to="/customize">Custom</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>

            <div className="flex items-center gap-4 text-[#5B3B32]">
              <button onClick={() => setSearchOpen(true)}>
                <FiSearch size={21} />
              </button>

              <Link to="/wishlist" className="relative hidden sm:block">
                <FiHeart size={21} />

                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setCartOpen(true)} className="relative">
                <FiShoppingBag size={21} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="lg:hidden pb-5 bg-[#fffaf7]/90 backdrop-blur-xl">
              <div className="grid gap-3 text-sm tracking-[0.18em] uppercase text-[#5B3B32]">
                <Link onClick={() => setMenuOpen(false)} to="/">Home</Link>
                <Link onClick={() => setMenuOpen(false)} to="/products">Collection</Link>
                <Link onClick={() => setMenuOpen(false)} to="/lookbook">Lookbook</Link>
                <Link onClick={() => setMenuOpen(false)} to="/customize">Custom Design</Link>
                <Link onClick={() => setMenuOpen(false)} to="/wishlist">Wishlist</Link>
                <Link onClick={() => setMenuOpen(false)} to="/about">About</Link>
                <Link onClick={() => setMenuOpen(false)} to="/faq">FAQ</Link>
                <Link onClick={() => setMenuOpen(false)} to="/contact">Contact</Link>
                <Link onClick={() => setMenuOpen(false)} to="/cart">Cart</Link>
              </div>
            </div>
          )}
        </Container>
      </nav>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MiniCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;