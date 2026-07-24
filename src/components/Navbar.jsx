import { useEffect, useState } from "react";
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
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logoutCustomer } = useCustomer();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logoutCustomer();
    setShowAccountMenu(false);
    setMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Announcement bar normal rahegi aur scroll hokar chali jayegi */}
      <AnnouncementBar />

      {/* Sirf navbar scroll par top par freeze hogi */}
      <nav
        className={`
          sticky left-0 right-0 top-0 z-[999] w-full
          border-b transition-all duration-300
          ${
            isScrolled
              ? "border-[#eadbd4]/70 bg-[#fffaf7]/75 shadow-[0_8px_30px_rgba(91,59,50,0.10)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#fffaf7]/60"
              : "border-[#eadbd4]/40 bg-[#fffaf7]"
          }
        `}
      >
        <Container>
          <div
            className={`
              flex w-full min-w-0 items-center justify-between gap-2
              transition-all duration-300 sm:gap-4
              ${
                isScrolled
                  ? "h-[68px] md:h-[76px]"
                  : "h-20 md:h-24"
              }
            `}
          >
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen((previous) => !previous);
                setShowAccountMenu(false);
              }}
              className="shrink-0 text-[#5B3B32] transition-colors hover:text-[#9A3F4D] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <FiX size={25} /> : <FiMenu size={25} />}
            </button>

            {/* Desktop left navigation */}
            <ul className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#5B3B32] lg:flex">
              <li>
                <Link
                  to="/"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/products"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  Collection
                </Link>
              </li>

              <li>
                <Link
                  to="/lookbook"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  Lookbook
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  About
                </Link>
              </li>
            </ul>

            {/* Logo */}
            <Link
              to="/"
              onClick={() => {
                setMenuOpen(false);
                setShowAccountMenu(false);
              }}
              className="flex min-w-0 flex-1 flex-col items-center justify-center text-center leading-none lg:flex-none"
            >
              <div
                className={`
                  logo-font whitespace-nowrap text-[#9A3F4D]
                  transition-all duration-300
                  ${
                    isScrolled
                      ? "text-4xl md:text-5xl"
                      : "text-4xl sm:text-5xl md:text-6xl"
                  }
                `}
              >
                Parikta
              </div>

              <div
                className={`
                  whitespace-nowrap font-semibold text-[#BFA996]
                  transition-all duration-300
                  ${
                    isScrolled
                      ? "text-[8px] tracking-[0.34em] md:text-[10px]"
                      : "text-[8px] tracking-[0.34em] sm:text-[10px] sm:tracking-[0.45em] md:text-xs"
                  }
                `}
              >
                FASHION
              </div>
            </Link>

            {/* Desktop right navigation */}
            <ul className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#5B3B32] lg:flex">
              <li>
                <Link
                  to="/customize"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  Custom
                </Link>
              </li>

              <li>
                <Link
                  to="/faq"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  FAQ
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-[#9A3F4D]"
                >
                  Contact
                </Link>
              </li>
            </ul>

            {/* Navbar actions */}
            <div className="flex shrink-0 items-center gap-2.5 text-[#5B3B32] sm:gap-4">
              {/* Search */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setShowAccountMenu(false);
                }}
                className="hidden transition-colors hover:text-[#9A3F4D] sm:inline-flex"
                aria-label="Open search"
              >
                <FiSearch size={21} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative hidden transition-colors hover:text-[#9A3F4D] sm:block"
                aria-label="Wishlist"
              >
                <FiHeart size={21} />

                {wishlistCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9A3F4D] px-1 text-[10px] text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={() => {
                  openCart();
                  setShowAccountMenu(false);
                }}
                className="relative shrink-0 transition-colors hover:text-[#9A3F4D]"
                aria-label="Open cart"
              >
                <FiShoppingBag size={21} />

                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9A3F4D] px-1 text-[10px] text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Customer account */}
              <div className="relative">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowAccountMenu(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eadbd4] bg-white/50 transition-all hover:border-[#9A3F4D] hover:text-[#9A3F4D] sm:h-9 sm:w-9"
                    aria-label="Login or sign up"
                  >
                    <FiUser size={20} />
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountMenu((previous) => !previous);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2"
                      aria-label="Open account menu"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9A3F4D] font-bold text-white sm:h-9 sm:w-9">
                        {customer?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div className="hidden text-left xl:block">
                        <p className="text-[10px] text-[#8b746b]">
                          Welcome
                        </p>

                        <p className="max-w-[120px] truncate text-xs font-bold text-[#5B3B32]">
                          {customer?.name || "Customer"}
                        </p>
                      </div>

                      <FiChevronDown
                        size={16}
                        className={`
                          hidden transition-transform duration-200 xl:block
                          ${showAccountMenu ? "rotate-180" : ""}
                        `}
                      />
                    </button>

                    {showAccountMenu && (
                      <div className="absolute right-0 z-[1100] mt-4 w-64 overflow-hidden rounded-2xl border border-[#eadbd4] bg-[#fffaf7]/95 shadow-2xl backdrop-blur-xl">
                        <div className="border-b border-[#eadbd4] p-5">
                          <h3 className="font-bold text-[#5B3B32]">
                            {customer?.name || "Parikta Customer"}
                          </h3>

                          {customer?.email && (
                            <p className="break-all text-sm text-[#8b746b]">
                              {customer.email}
                            </p>
                          )}

                          {customer?.phone && (
                            <p className="mt-1 text-xs text-[#9a8982]">
                              +91 {customer.phone}
                            </p>
                          )}
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-5 py-4 transition-colors hover:bg-[#f7f2ee]"
                        >
                          My Profile
                        </Link>

                        <Link
                          to="/my-orders"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-5 py-4 transition-colors hover:bg-[#f7f2ee]"
                        >
                          My Orders
                        </Link>

                        <Link
                          to="/wishlist"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-5 py-4 transition-colors hover:bg-[#f7f2ee]"
                        >
                          Wishlist
                        </Link>

                        <Link
                          to="/saved-addresses"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-5 py-4 transition-colors hover:bg-[#f7f2ee]"
                        >
                          Saved Addresses
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full px-5 py-4 text-left text-red-600 transition-colors hover:bg-red-50"
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

          {/* Mobile navigation menu */}
          {menuOpen && (
            <div className="border-t border-[#eadbd4]/70 bg-[#fffaf7]/95 pb-5 pt-4 backdrop-blur-2xl lg:hidden">
              <div className="grid gap-4 text-sm uppercase tracking-[0.18em] text-[#5B3B32]">
                <Link onClick={closeMobileMenu} to="/">
                  Home
                </Link>

                <Link onClick={closeMobileMenu} to="/products">
                  Collection
                </Link>

                <Link onClick={closeMobileMenu} to="/lookbook">
                  Lookbook
                </Link>

                <Link onClick={closeMobileMenu} to="/customize">
                  Custom Design
                </Link>

                <Link onClick={closeMobileMenu} to="/wishlist">
                  Wishlist
                </Link>

                <Link onClick={closeMobileMenu} to="/about">
                  About
                </Link>

                <Link onClick={closeMobileMenu} to="/faq">
                  FAQ
                </Link>

                <Link onClick={closeMobileMenu} to="/contact">
                  Contact
                </Link>

                <Link onClick={closeMobileMenu} to="/track-order">
                  Track Order
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="text-left uppercase tracking-[0.18em]"
                >
                  Search
                </button>

                {!isLoggedIn ? (
                  <Link
                    onClick={closeMobileMenu}
                    to="/login"
                    className="font-semibold text-[#9A3F4D]"
                  >
                    Login / Sign Up
                  </Link>
                ) : (
                  <>
                    <Link onClick={closeMobileMenu} to="/profile">
                      My Profile
                    </Link>

                    <Link onClick={closeMobileMenu} to="/my-orders">
                      My Orders
                    </Link>

                    <Link
                      onClick={closeMobileMenu}
                      to="/saved-addresses"
                    >
                      Saved Addresses
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-left uppercase tracking-[0.18em] text-red-600"
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

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <CartDrawer />
    </>
  );
}

export default Navbar;