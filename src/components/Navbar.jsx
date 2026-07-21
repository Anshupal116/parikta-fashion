import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiX,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCustomer } from "../context/CustomerContext";

import Container from "./Container";
import AnnouncementBar from "./AnnouncementBar";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";

function Navbar() {
  const {
  cartCount,
  openCart,
} = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logoutCustomer } = useCustomer();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleLogout = () => {
    logoutCustomer();
    setShowAccountMenu(false);
  };

  return (
    <>
      <AnnouncementBar />

      <nav className="sticky top-0 z-50 w-full max-w-full overflow-x-clip bg-[#fffaf7]/75 backdrop-blur-xl border-b border-[#eadbd4]/70 shadow-sm">
        <Container>
          <div className="h-20 md:h-24 w-full min-w-0 flex items-center justify-between gap-2 sm:gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden shrink-0 text-[#5B3B32]"
            >
              {menuOpen ? <FiX size={25} /> : <FiMenu size={25} />}
            </button>

            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Collection</Link></li>
              <li><Link to="/lookbook">Lookbook</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>

            <Link to="/" className="min-w-0 flex-1 lg:flex-none flex justify-center text-center leading-none">
              <div className="logo-font text-4xl sm:text-5xl md:text-6xl text-[#9A3F4D] whitespace-nowrap">
                Parikta
              </div>
              <div className="tracking-[0.34em] sm:tracking-[0.45em] text-[8px] sm:text-[10px] md:text-xs text-[#BFA996] font-semibold whitespace-nowrap">
                FASHION
              </div>
            </Link>

            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li><Link to="/customize">Custom</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>

            <div className="flex shrink-0 items-center gap-2.5 sm:gap-4 text-[#5B3B32]">
              <button onClick={() => setSearchOpen(true)} className="hidden sm:inline-flex">
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

              <button onClick={openCart} className="relative shrink-0">
                <FiShoppingBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="relative">
                {!isLoggedIn ? (
                  <Link to="/login">
                    <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#eadbd4] flex items-center justify-center hover:text-[#9A3F4D]">
                      <FiUser size={20} />
                    </button>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                      className="flex items-center gap-2"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#9A3F4D] text-white flex items-center justify-center font-bold">
                        {customer?.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="hidden xl:block text-left">
                        <p className="text-[10px] text-[#8b746b]">Welcome</p>
                        <p className="text-xs font-bold text-[#5B3B32]">
                          {customer?.name}
                        </p>
                      </div>

                      <FiChevronDown className="hidden xl:block" size={16} />
                    </button>

                    {showAccountMenu && (
                      <div className="absolute right-0 mt-4 w-64 bg-[#fffaf7] rounded-2xl shadow-2xl border border-[#eadbd4] overflow-hidden z-[100]">
                        <div className="p-5 border-b border-[#eadbd4]">
                          <h3 className="font-bold text-[#5B3B32]">
                            {customer?.name}
                          </h3>
                          <p className="text-sm text-[#8b746b] break-all">
                            {customer?.email}
                          </p>
                        </div>

                        <Link
                          onClick={() => setShowAccountMenu(false)}
                          to="/profile"
                          className="block px-5 py-4 hover:bg-[#f7f2ee]"
                        >
                          My Profile
                        </Link>

                        <Link
                          onClick={() => setShowAccountMenu(false)}
                          to="/my-orders"
                          className="block px-5 py-4 hover:bg-[#f7f2ee]"
                        >
                          My Orders
                        </Link>

                        <Link
                          onClick={() => setShowAccountMenu(false)}
                          to="/wishlist"
                          className="block px-5 py-4 hover:bg-[#f7f2ee]"
                        >
                          Wishlist
                        </Link>

                        <Link
                          onClick={() => setShowAccountMenu(false)}
                          to="/saved-addresses"
                          className="block px-5 py-4 hover:bg-[#f7f2ee]"
                        >
                          Saved Addresses
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-4 text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
                <Link onClick={() => setMenuOpen(false)} to="/track-order">Track Order</Link>
                <Link onClick={() => setMenuOpen(false)} to="/cart">Cart</Link>

                {!isLoggedIn ? (
                  <>
                    <Link onClick={() => setMenuOpen(false)} to="/login">Login</Link>
                    <Link onClick={() => setMenuOpen(false)} to="/register">Register</Link>
                  </>
                ) : (
                  <>
                    <Link onClick={() => setMenuOpen(false)} to="/profile">My Profile</Link>
                    <Link onClick={() => setMenuOpen(false)} to="/my-orders">My Orders</Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="text-left text-red-600 uppercase tracking-[0.18em]"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Container>
      </nav>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}

export default Navbar;