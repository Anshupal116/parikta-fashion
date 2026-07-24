import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCustomer } from "../context/CustomerContext";

import Container from "./Container";
import AnnouncementBar from "./AnnouncementBar";
import SearchOverlay from "./SearchOverlay";
import MiniCartDrawer from "./MiniCartDrawer";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const {
    customer,
    isLoggedIn,
    logoutCustomer,
  } = useCustomer();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] =
    useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setShowAccountMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleLogout = () => {
    logoutCustomer();
    setShowAccountMenu(false);
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <AnnouncementBar />

      <nav className="sticky top-0 z-50 bg-[#fffaf7]/85 backdrop-blur-xl border-b border-[#eadbd4]/80 shadow-sm">
        <Container>
          <div className="h-20 md:h-24 flex items-center justify-between gap-4">
            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="lg:hidden text-[#5B3B32]"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <FiX size={25} />
              ) : (
                <FiMenu size={25} />
              )}
            </button>

            {/* DESKTOP LEFT MENU */}
            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li>
                <Link
                  to="/"
                  className={
                    isActive("/")
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/products"
                  className={
                    location.pathname.startsWith(
                      "/products"
                    ) ||
                    location.pathname.startsWith(
                      "/product/"
                    )
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  Collection
                </Link>
              </li>

              <li>
                <Link
                  to="/lookbook"
                  className={
                    isActive("/lookbook")
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  Lookbook
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className={
                    isActive("/about")
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  About
                </Link>
              </li>
            </ul>

            {/* LOGO */}
            <Link
              to="/"
              className="text-center leading-none shrink-0"
            >
              <div className="logo-font text-5xl md:text-6xl text-[#9A3F4D]">
                Parikta
              </div>

              <div className="tracking-[0.45em] text-[10px] md:text-xs text-[#BFA996] font-semibold">
                FASHION
              </div>
            </Link>

            {/* DESKTOP RIGHT MENU */}
            <ul className="hidden lg:flex items-center gap-8 text-xs tracking-[0.22em] font-semibold text-[#5B3B32] uppercase">
              <li>
                <Link
                  to="/customize"
                  className={
                    isActive("/customize")
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  Custom
                </Link>
              </li>

              <li>
                <Link
                  to="/track-order"
                  className={
                    location.pathname.startsWith(
                      "/track-order"
                    )
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  Track Order
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className={
                    isActive("/contact")
                      ? "text-[#9A3F4D]"
                      : "hover:text-[#9A3F4D]"
                  }
                >
                  Contact
                </Link>
              </li>
            </ul>

            {/* ICONS */}
            <div className="flex items-center gap-3 md:gap-4 text-[#5B3B32]">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hover:text-[#9A3F4D] transition"
                aria-label="Search"
              >
                <FiSearch size={21} />
              </button>

              <Link
                to="/wishlist"
                className="relative hidden sm:block hover:text-[#9A3F4D] transition"
                aria-label="Wishlist"
              >
                <FiHeart size={21} />

                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative hover:text-[#9A3F4D] transition"
                aria-label="Shopping bag"
              >
                <FiShoppingBag size={21} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#9A3F4D] text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* ACCOUNT */}
              <div
                ref={accountMenuRef}
                className="relative"
              >
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="w-9 h-9 rounded-full border border-[#eadbd4] bg-white flex items-center justify-center hover:text-[#9A3F4D] hover:border-[#9A3F4D] transition"
                    aria-label="Login"
                  >
                    <FiUser size={19} />
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setShowAccountMenu(
                          (prev) => !prev
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#9A3F4D] text-white flex items-center justify-center font-bold">
                        {customer?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "A"}
                      </div>

                      <div className="hidden xl:block text-left max-w-28">
                        <p className="text-[10px] text-[#8b746b] normal-case tracking-normal">
                          Welcome
                        </p>

                        <p className="text-xs font-bold text-[#5B3B32] truncate normal-case tracking-normal">
                          {customer?.name}
                        </p>
                      </div>

                      <FiChevronDown
                        className="hidden xl:block"
                        size={15}
                      />
                    </button>

                    {showAccountMenu && (
                      <div className="absolute right-0 mt-4 w-64 bg-[#fffaf7] rounded-2xl shadow-2xl border border-[#eadbd4] overflow-hidden z-[100]">
                        <div className="p-5 border-b border-[#eadbd4]">
                          <p className="text-xs tracking-[0.18em] uppercase text-[#BFA996]">
                            My Account
                          </p>

                          <h3 className="font-bold text-[#5B3B32] mt-2">
                            {customer?.name}
                          </h3>

                          <p className="text-sm text-[#8b746b] break-all mt-1">
                            {customer?.email}
                          </p>
                        </div>

                        <div className="py-2 text-sm text-[#5B3B32]">
                          <Link
                            to="/profile"
                            className="block px-5 py-3 hover:bg-[#f7f2ee]"
                          >
                            My Profile
                          </Link>

                          <Link
                            to="/my-orders"
                            className="block px-5 py-3 hover:bg-[#f7f2ee]"
                          >
                            My Orders
                          </Link>

                          <Link
                            to="/wishlist"
                            className="block px-5 py-3 hover:bg-[#f7f2ee]"
                          >
                            Wishlist
                          </Link>

                          <Link
                            to="/saved-addresses"
                            className="block px-5 py-3 hover:bg-[#f7f2ee]"
                          >
                            Saved Addresses
                          </Link>

                          <Link
                            to="/track-order"
                            className="block px-5 py-3 hover:bg-[#f7f2ee]"
                          >
                            Track Order
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-4 text-red-600 border-t border-[#eadbd4] hover:bg-red-50 font-semibold"
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

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="lg:hidden pb-6 border-t border-[#eadbd4]/70 pt-5">
              <div className="grid gap-4 text-sm tracking-[0.16em] uppercase text-[#5B3B32]">
                <Link to="/">Home</Link>
                <Link to="/products">
                  Collection
                </Link>
                <Link to="/lookbook">
                  Lookbook
                </Link>
                <Link to="/customize">
                  Custom Design
                </Link>
                <Link to="/wishlist">
                  Wishlist
                </Link>
                <Link to="/track-order">
                  Track Order
                </Link>
                <Link to="/about">About</Link>
                <Link to="/contact">
                  Contact
                </Link>

                {!isLoggedIn ? (
                  <>
                    <div className="h-px bg-[#eadbd4]" />

                    <Link
                      to="/login"
                      className="text-[#9A3F4D] font-bold"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="text-[#9A3F4D] font-bold"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="h-px bg-[#eadbd4]" />

                    <p className="normal-case tracking-normal text-[#8b746b]">
                      Hi,{" "}
                      <span className="font-bold text-[#5B3B32]">
                        {customer?.name}
                      </span>
                    </p>

                    <Link to="/profile">
                      My Profile
                    </Link>

                    <Link to="/my-orders">
                      My Orders
                    </Link>

                    <Link to="/saved-addresses">
                      Saved Addresses
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-left text-red-600 uppercase tracking-[0.16em] font-semibold"
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

      <MiniCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}

export default Navbar;