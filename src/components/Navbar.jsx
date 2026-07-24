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
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const {
    customer,
    isLoggedIn,
    logoutCustomer,
  } = useCustomer();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] =
    useState(false);

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
      {/* Fixed header wrapper */}
      <header className="fixed left-0 right-0 top-0 z-[999] w-full">
        <AnnouncementBar />

        <nav
          className="
            w-full
            border-b
            border-white/40
            bg-[#fffaf7]/70
            shadow-[0_8px_30px_rgba(91,59,50,0.06)]
            backdrop-blur-2xl
            transition-all
            duration-300
            supports-[backdrop-filter]:bg-[#fffaf7]/55
          "
        >
          <Container>
            <div className="flex h-20 w-full min-w-0 items-center justify-between gap-2 sm:gap-4 md:h-24">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="shrink-0 text-[#5B3B32] transition hover:text-[#9A3F4D] lg:hidden"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? (
                  <FiX size={25} />
                ) : (
                  <FiMenu size={25} />
                )}
              </button>

              {/* Desktop left menu */}
              <ul className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#5B3B32] lg:flex">
                <li>
                  <Link
                    to="/"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    to="/products"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    Collection
                  </Link>
                </li>

                <li>
                  <Link
                    to="/lookbook"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    Lookbook
                  </Link>
                </li>

                <li>
                  <Link
                    to="/about"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    About
                  </Link>
                </li>
              </ul>

              {/* Logo */}
              <Link
                to="/"
                className="flex min-w-0 flex-1 flex-col items-center justify-center text-center leading-none lg:flex-none"
              >
                <div className="logo-font whitespace-nowrap text-4xl text-[#9A3F4D] sm:text-5xl md:text-6xl">
                  Parikta
                </div>

                <div className="whitespace-nowrap text-[8px] font-semibold tracking-[0.34em] text-[#BFA996] sm:text-[10px] sm:tracking-[0.45em] md:text-xs">
                  FASHION
                </div>
              </Link>

              {/* Desktop right menu */}
              <ul className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#5B3B32] lg:flex">
                <li>
                  <Link
                    to="/customize"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    Custom
                  </Link>
                </li>

                <li>
                  <Link
                    to="/faq"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    FAQ
                  </Link>
                </li>

                <li>
                  <Link
                    to="/contact"
                    className="transition hover:text-[#9A3F4D]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2.5 text-[#5B3B32] sm:gap-4">
                {/* Search */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden transition hover:text-[#9A3F4D] sm:inline-flex"
                  aria-label="Open search"
                >
                  <FiSearch size={21} />
                </button>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative hidden transition hover:text-[#9A3F4D] sm:block"
                  aria-label="Wishlist"
                >
                  <FiHeart size={21} />

                  {wishlistCount > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#9A3F4D] text-[10px] text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  type="button"
                  onClick={openCart}
                  className="relative shrink-0 transition hover:text-[#9A3F4D]"
                  aria-label="Open cart"
                >
                  <FiShoppingBag size={21} />

                  {cartCount > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#9A3F4D] text-[10px] text-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Account */}
                <div className="relative">
                  {!isLoggedIn ? (
                    <Link to="/login">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eadbd4] bg-white/40 transition hover:border-[#9A3F4D] hover:text-[#9A3F4D] sm:h-9 sm:w-9">
                        <FiUser size={20} />
                      </span>
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAccountMenu((prev) => !prev)
                        }
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9A3F4D] font-bold text-white sm:h-9 sm:w-9">
                          {customer?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
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
                          className={`hidden transition-transform duration-200 xl:block ${
                            showAccountMenu
                              ? "rotate-180"
                              : ""
                          }`}
                          size={16}
                        />
                      </button>

                      {showAccountMenu && (
                        <div className="absolute right-0 z-[1100] mt-4 w-64 overflow-hidden rounded-2xl border border-[#eadbd4] bg-[#fffaf7]/95 shadow-2xl backdrop-blur-xl">
                          <div className="border-b border-[#eadbd4] p-5">
                            <h3 className="font-bold text-[#5B3B32]">
                              {customer?.name ||
                                "Parikta Customer"}
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
                            onClick={() =>
                              setShowAccountMenu(false)
                            }
                            to="/profile"
                            className="block px-5 py-4 transition hover:bg-[#f7f2ee]"
                          >
                            My Profile
                          </Link>

                          <Link
                            onClick={() =>
                              setShowAccountMenu(false)
                            }
                            to="/my-orders"
                            className="block px-5 py-4 transition hover:bg-[#f7f2ee]"
                          >
                            My Orders
                          </Link>

                          <Link
                            onClick={() =>
                              setShowAccountMenu(false)
                            }
                            to="/wishlist"
                            className="block px-5 py-4 transition hover:bg-[#f7f2ee]"
                          >
                            Wishlist
                          </Link>

                          <Link
                            onClick={() =>
                              setShowAccountMenu(false)
                            }
                            to="/saved-addresses"
                            className="block px-5 py-4 transition hover:bg-[#f7f2ee]"
                          >
                            Saved Addresses
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full px-5 py-4 text-left text-red-600 transition hover:bg-red-50"
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

            {/* Mobile menu */}
            {menuOpen && (
              <div className="border-t border-[#eadbd4]/70 bg-[#fffaf7]/90 pb-5 pt-4 backdrop-blur-2xl lg:hidden">
                <div className="grid gap-4 text-sm uppercase tracking-[0.18em] text-[#5B3B32]">
                  <Link
                    onClick={closeMobileMenu}
                    to="/"
                  >
                    Home
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/products"
                  >
                    Collection
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/lookbook"
                  >
                    Lookbook
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/customize"
                  >
                    Custom Design
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/wishlist"
                  >
                    Wishlist
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/about"
                  >
                    About
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/faq"
                  >
                    FAQ
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/contact"
                  >
                    Contact
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/track-order"
                  >
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
                      <Link
                        onClick={closeMobileMenu}
                        to="/profile"
                      >
                        My Profile
                      </Link>

                      <Link
                        onClick={closeMobileMenu}
                        to="/my-orders"
                      >
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
      </header>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <CartDrawer />
    </>
  );
}

export default Navbar;