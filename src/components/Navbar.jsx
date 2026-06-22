import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Container from "./Container";

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim() !== "") {
      navigate(`/products?search=${search}`);
      setSearch("");
    }
  };

  return (
    <>
      <div className="bg-[#9A3F4D] text-white text-center text-sm py-2 tracking-wide">
        ✨ Free Shipping on Orders Above ₹999 | Custom Made With Love
      </div>

      <nav className="bg-[#fffaf7] border-b border-[#eadbd4] sticky top-0 z-50">
        <Container>
          <div className="h-24 flex items-center justify-between gap-6">
            <Link to="/" className="text-center leading-none">
              <div className="logo-font text-4xl md:text-5xl lg:text-6xl text-[#9A3F4D]">
                Parikta
              </div>
              <div className="tracking-[0.45em] text-xs text-[#BFA996] font-semibold">
                FASHION
              </div>
            </Link>

            <ul className="hidden lg:flex items-center gap-8 text-sm tracking-wide font-medium text-[#5B3B32]">
              <li><Link to="/">HOME</Link></li>
              <li><Link to="/products">COLLECTION</Link></li>
              <li><Link to="/customize">CUSTOMIZE</Link></li>
              <li><Link to="/wishlist">WISHLIST</Link></li>
              <li><Link to="/contact">CONTACT</Link></li>
            </ul>

            <div className="hidden lg:flex flex-1 max-w-sm">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search designer outfits..."
                className="w-full bg-[#f7f2ee] border border-[#eadbd4] rounded-full px-5 py-3 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div className="flex items-center gap-5 text-[#5B3B32]">
              <Link to="/wishlist" className="relative text-2xl">
                ♡
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#BFA996] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative text-2xl">
                👜
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#BFA996] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button className="hidden sm:block border border-[#9A3F4D] text-[#9A3F4D] px-5 py-2 rounded-full font-semibold hover:bg-[#9A3F4D] hover:text-white">
                Account
              </button>
            </div>
          </div>
        </Container>
      </nav>
    </>
  );
}

export default Navbar;