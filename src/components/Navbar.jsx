import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Container from "./Container";

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim() !== "") {
      navigate(`/products?search=${search}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div className="bg-[#FDEAE6] text-[#5B3B32] text-center text-[11px] md:text-sm py-2 tracking-[0.18em] uppercase">
        Free Shipping on Prepaid Orders | COD Available
      </div>

      <nav className="bg-[#fffaf7] border-b border-[#eadbd4] sticky top-0 z-50">
        <Container>
          <div className="h-20 md:h-24 flex items-center justify-between gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-2xl text-[#5B3B32]"
            >
              ☰
            </button>

            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">New Arrivals</Link></li>
              <li><Link to="/products">Ethnic</Link></li>
              <li><Link to="/products">Western</Link></li>
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
              <li><Link to="/products">Fusion</Link></li>
              <li><Link to="/customize">Custom Design</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              
            </ul>

            <div className="flex items-center gap-4 text-[#5B3B32]">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-xl"
              >
                🔍
              </button>

              <Link to="/wishlist" className="relative text-xl hidden sm:block">
                ♡
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative text-xl">
                👜
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {menuOpen && (
            <div className="lg:hidden pb-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search designer outfits..."
                className="w-full bg-white border border-[#eadbd4] rounded-full px-5 py-3 outline-none mb-4"
              />

              <div className="grid gap-3 text-sm tracking-[0.18em] uppercase text-[#5B3B32]">
                <Link onClick={() => setMenuOpen(false)} to="/">Home</Link>
                <Link onClick={() => setMenuOpen(false)} to="/products">Collection</Link>
                <Link onClick={() => setMenuOpen(false)} to="/customize">Custom Design</Link>
                <Link onClick={() => setMenuOpen(false)} to="/wishlist">Wishlist</Link>
                <Link onClick={() => setMenuOpen(false)} to="/cart">Cart</Link>
                <Link onClick={() => setMenuOpen(false)} to="/about">About</Link>
                <Link onClick={() => setMenuOpen(false)} to="/contact">Contact</Link>
              </div>
            </div>
          )}
        </Container>
      </nav>
    </>
  );
}

export default Navbar;