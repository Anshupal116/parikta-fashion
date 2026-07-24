import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiPackage,
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

const megaMenuCategories = [
  {
    title: "Shop by Category",
    links: [
      { label: "Sarees", to: "/products?category=Saree" },
      { label: "Suits", to: "/products?category=Suit" },
      { label: "Kurtis", to: "/products?category=Kurti" },
      { label: "Lehengas", to: "/products?category=Lehenga" },
    ],
  },
  {
    title: "Shop by Occasion",
    links: [
      { label: "Wedding Wear", to: "/products?occasion=Wedding" },
      { label: "Festive Wear", to: "/products?occasion=Festive" },
      { label: "Party Wear", to: "/products?occasion=Party" },
      { label: "Everyday Wear", to: "/products?occasion=Casual" },
    ],
  },
  {
    title: "Featured",
    links: [
      { label: "New Arrivals", to: "/products?sort=newest" },
      { label: "Best Sellers", to: "/products?sort=best-selling" },
      { label: "Premium Collection", to: "/products?badge=Premium" },
      { label: "Sale", to: "/products?discount=true" },
    ],
  },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const accountMenuRef = useRef(null);
  const wishlistMenuRef = useRef(null);
  const megaMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const { cartCount = 0 } = useCart();
  const { wishlistCount = 0 } = useWishlist();

  const {
    customer,
    isLoggedIn,
    logoutCustomer,
  } = useCustomer();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] =
    useState(false);
  const [showWishlistMenu, setShowWishlistMenu] =
    useState(false);
  const [showMegaMenu, setShowMegaMenu] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Navbar scroll effect
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Close menus after route change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setMenuOpen(false);
    setShowAccountMenu(false);
    setShowWishlistMenu(false);
    setShowMegaMenu(false);
    setDesktopSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname, location.search]);

  /*
  |--------------------------------------------------------------------------
  | Focus desktop search
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (desktopSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
    }
  }, [desktopSearchOpen]);

  /*
  |--------------------------------------------------------------------------
  | Close dropdowns when clicked outside
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setShowAccountMenu(false);
      }

      if (
        wishlistMenuRef.current &&
        !wishlistMenuRef.current.contains(event.target)
      ) {
        setShowWishlistMenu(false);
      }

      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target)
      ) {
        setShowMegaMenu(false);
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

  /*
  |--------------------------------------------------------------------------
  | Lock mobile body scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /*
  |--------------------------------------------------------------------------
  | Handlers
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logoutCustomer();

    setShowAccountMenu(false);
    setMenuOpen(false);

    navigate("/");
  };

  const handleDesktopSearch = (event) => {
    event.preventDefault();

    const value = searchQuery.trim();

    if (!value) return;

    navigate(
      `/products?search=${encodeURIComponent(value)}`
    );

    setDesktopSearchOpen(false);
    setSearchQuery("");
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu((previous) => !previous);
    setShowWishlistMenu(false);
    setShowMegaMenu(false);
  };

  const toggleWishlistMenu = () => {
    setShowWishlistMenu((previous) => !previous);
    setShowAccountMenu(false);
    setShowMegaMenu(false);
  };

  const isActive = (path) =>
    location.pathname === path;

  const isProductsActive =
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/product/");

  const customerInitial =
    customer?.name?.trim()?.charAt(0)?.toUpperCase() ||
    customer?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      <AnnouncementBar />

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-[#fffaf7]/75 backdrop-blur-2xl border-b border-[#eadbd4]/70 shadow-[0_12px_40px_rgba(91,59,50,0.10)]"
            : "bg-[#fffaf7]/90 backdrop-blur-lg border-b border-[#eadbd4]/40 shadow-none"
        }`}
      >
        <Container>
          <div
            className={`flex items-center justify-between gap-3 transition-all duration-500 ease-out ${
              scrolled
                ? "h-[70px] md:h-[76px]"
                : "h-[82px] md:h-[96px]"
            }`}
          >
            {/* Mobile menu button */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen((previous) => !previous)
              }
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#5B3B32] hover:text-[#9A3F4D] hover:bg-white/70 transition-all duration-300"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? (
                <FiX size={24} />
              ) : (
                <FiMenu size={24} />
              )}
            </button>

            {/* Desktop left navigation */}

            <nav className="hidden lg:flex flex-1 items-center">
              <ul className="flex items-center gap-7 xl:gap-9 text-[11px] xl:text-xs tracking-[0.18em] font-semibold text-[#5B3B32] uppercase">
                <li>
                  <Link
                    to="/"
                    className={`luxury-nav-link ${
                      isActive("/")
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    Home
                  </Link>
                </li>

                {/* Mega menu */}

                <li
                  ref={megaMenuRef}
                  className="relative"
                  onMouseEnter={() =>
                    setShowMegaMenu(true)
                  }
                  onMouseLeave={() =>
                    setShowMegaMenu(false)
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowMegaMenu(
                        (previous) => !previous
                      )
                    }
                    className={`luxury-nav-link flex items-center gap-1.5 uppercase tracking-[0.18em] ${
                      isProductsActive
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    Collection

                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${
                        showMegaMenu
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute left-0 top-full pt-7 transition-all duration-300 ${
                      showMegaMenu
                        ? "visible opacity-100 translate-y-0"
                        : "invisible opacity-0 -translate-y-3 pointer-events-none"
                    }`}
                  >
                    <div className="w-[720px] rounded-[28px] border border-[#eadbd4]/90 bg-[#fffaf7]/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(91,59,50,0.18)] overflow-hidden">
                      <div className="grid grid-cols-3 gap-8 p-8">
                        {megaMenuCategories.map(
                          (section) => (
                            <div key={section.title}>
                              <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#9A3F4D] font-bold mb-5">
                                {section.title}
                              </h3>

                              <div className="space-y-3.5">
                                {section.links.map(
                                  (item) => (
                                    <Link
                                      key={item.label}
                                      to={item.to}
                                      className="block text-sm normal-case tracking-normal font-medium text-[#5B3B32] hover:text-[#9A3F4D] hover:translate-x-1 transition-all duration-300"
                                    >
                                      {item.label}
                                    </Link>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 bg-[#f7eee9]/80 border-t border-[#eadbd4] px-8 py-5">
                        <div>
                          <p className="text-sm font-semibold text-[#5B3B32] normal-case tracking-normal">
                            Explore the complete Parikta
                            collection
                          </p>

                          <p className="text-xs text-[#8b746b] normal-case tracking-normal mt-1">
                            Carefully selected designs for
                            every occasion.
                          </p>
                        </div>

                        <Link
                          to="/products"
                          className="shrink-0 rounded-full bg-[#9A3F4D] text-white px-6 py-3 text-[10px] tracking-[0.18em] uppercase hover:bg-[#7f303e] transition-colors"
                        >
                          Shop All
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>

                <li>
                  <Link
                    to="/lookbook"
                    className={`luxury-nav-link ${
                      isActive("/lookbook")
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    Lookbook
                  </Link>
                </li>

                <li>
                  <Link
                    to="/about"
                    className={`luxury-nav-link ${
                      isActive("/about")
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Logo */}

            <Link
              to="/"
              className="shrink-0 text-center leading-none group"
              aria-label="Parikta Fashion home"
            >
              <div
                className={`logo-font text-[#9A3F4D] transition-all duration-500 ease-out group-hover:tracking-wide ${
                  scrolled
                    ? "text-[42px] md:text-[50px]"
                    : "text-[50px] md:text-[62px]"
                }`}
              >
                Parikta
              </div>

              <div
                className={`font-semibold text-[#BFA996] transition-all duration-500 ${
                  scrolled
                    ? "text-[8px] md:text-[9px] tracking-[0.38em]"
                    : "text-[9px] md:text-[11px] tracking-[0.45em]"
                }`}
              >
                FASHION
              </div>
            </Link>

            {/* Desktop right navigation */}

            <nav className="hidden lg:flex flex-1 items-center justify-end">
              <ul className="flex items-center gap-7 xl:gap-9 text-[11px] xl:text-xs tracking-[0.18em] font-semibold text-[#5B3B32] uppercase">
                <li>
                  <Link
                    to="/customize"
                    className={`luxury-nav-link ${
                      isActive("/customize")
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    Custom
                  </Link>
                </li>

                <li>
                  <Link
                    to="/track-order"
                    className={`luxury-nav-link ${
                      location.pathname.startsWith(
                        "/track-order"
                      )
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    Track Order
                  </Link>
                </li>

                <li>
                  <Link
                    to="/contact"
                    className={`luxury-nav-link ${
                      isActive("/contact")
                        ? "text-[#9A3F4D]"
                        : ""
                    }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Icons section */}

            <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-3 text-[#5B3B32]">
              {/* Animated desktop search */}

              <form
                onSubmit={handleDesktopSearch}
                className={`hidden md:flex items-center overflow-hidden rounded-full border transition-all duration-500 ease-out ${
                  desktopSearchOpen
                    ? "w-52 xl:w-64 bg-white/80 border-[#d7bdb4] shadow-sm"
                    : "w-10 bg-transparent border-transparent"
                }`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search collection..."
                  className={`h-10 bg-transparent outline-none text-sm text-[#5B3B32] placeholder:text-[#a58e85] transition-all duration-500 ${
                    desktopSearchOpen
                      ? "w-full pl-4 opacity-100"
                      : "w-0 pl-0 opacity-0"
                  }`}
                />

                <button
                  type={
                    desktopSearchOpen
                      ? "submit"
                      : "button"
                  }
                  onClick={() => {
                    if (!desktopSearchOpen) {
                      setDesktopSearchOpen(true);
                    }
                  }}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:text-[#9A3F4D] hover:scale-110 transition-all duration-300"
                  aria-label="Search products"
                >
                  <FiSearch size={20} />
                </button>
              </form>

              {/* Mobile search */}

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:text-[#9A3F4D] hover:bg-white/70 hover:scale-110 transition-all duration-300"
                aria-label="Search products"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist preview */}

              <div
                ref={wishlistMenuRef}
                className="relative hidden sm:block"
              >
                <button
                  type="button"
                  onClick={toggleWishlistMenu}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center hover:text-[#9A3F4D] hover:bg-white/70 hover:scale-110 transition-all duration-300"
                  aria-label="Wishlist"
                >
                  <FiHeart size={20} />

                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#9A3F4D] text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow">
                      {wishlistCount > 99
                        ? "99+"
                        : wishlistCount}
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 top-full mt-4 w-72 rounded-[24px] border border-[#eadbd4] bg-[#fffaf7]/95 backdrop-blur-2xl shadow-[0_24px_60px_rgba(91,59,50,0.16)] overflow-hidden transition-all duration-300 ${
                    showWishlistMenu
                      ? "visible opacity-100 translate-y-0"
                      : "invisible opacity-0 -translate-y-3 pointer-events-none"
                  }`}
                >
                  <div className="p-5 border-b border-[#eadbd4]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#5B3B32]">
                        Your Wishlist
                      </h3>

                      <span className="text-xs text-[#9A3F4D] font-semibold">
                        {wishlistCount}{" "}
                        {wishlistCount === 1
                          ? "item"
                          : "items"}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-7 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#f5e9e4] text-[#9A3F4D] flex items-center justify-center">
                      <FiHeart size={24} />
                    </div>

                    {wishlistCount > 0 ? (
                      <>
                        <p className="mt-4 text-sm font-semibold text-[#5B3B32]">
                          Your favourite designs are waiting
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#8b746b]">
                          Open your wishlist to view and add
                          products to the bag.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 text-sm font-semibold text-[#5B3B32]">
                          Your wishlist is empty
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#8b746b]">
                          Save products you love and find them
                          here later.
                        </p>
                      </>
                    )}

                    <Link
                      to="/wishlist"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#9A3F4D] text-white py-3 text-[10px] tracking-[0.17em] uppercase font-semibold hover:bg-[#7f303e] transition-colors"
                    >
                      View Wishlist
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mini cart */}

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:text-[#9A3F4D] hover:bg-white/70 hover:scale-110 transition-all duration-300"
                aria-label="Open shopping bag"
              >
                <FiShoppingBag size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9A3F4D] text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow">
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </button>

              {/* Account */}

              <div
                ref={accountMenuRef}
                className="relative"
              >
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="w-10 h-10 rounded-full border border-[#eadbd4] bg-white/65 backdrop-blur-md flex items-center justify-center hover:text-[#9A3F4D] hover:border-[#9A3F4D] hover:scale-105 transition-all duration-300"
                    aria-label="Customer login"
                  >
                    <FiUser size={19} />
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={toggleAccountMenu}
                      className="flex items-center gap-2 rounded-full hover:bg-white/60 p-1 pr-1 xl:pr-3 transition-all duration-300"
                      aria-label="Open customer account menu"
                    >
                      {customer?.profileImage ||
                      customer?.image ? (
                        <img
                          src={
                            customer.profileImage ||
                            customer.image
                          }
                          alt={customer?.name || "Customer"}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b65b69] to-[#7d2f3d] text-white flex items-center justify-center text-sm font-bold shadow-md">
                          {customerInitial}
                        </div>
                      )}

                      <div className="hidden xl:block text-left max-w-[105px]">
                        <p className="text-[9px] leading-none text-[#9a8178]">
                          Welcome
                        </p>

                        <p className="mt-1 text-xs font-bold leading-none text-[#5B3B32] truncate">
                          {customer?.name || "Customer"}
                        </p>
                      </div>

                      <FiChevronDown
                        size={14}
                        className={`hidden xl:block transition-transform duration-300 ${
                          showAccountMenu
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute right-0 top-full mt-4 w-72 rounded-[26px] border border-[#eadbd4] bg-[#fffaf7]/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(91,59,50,0.18)] overflow-hidden transition-all duration-300 ${
                        showAccountMenu
                          ? "visible opacity-100 translate-y-0"
                          : "invisible opacity-0 -translate-y-3 pointer-events-none"
                      }`}
                    >
                      <div className="p-5 bg-gradient-to-br from-[#f8ece7] to-[#fffaf7] border-b border-[#eadbd4]">
                        <div className="flex items-center gap-3">
                          {customer?.profileImage ||
                          customer?.image ? (
                            <img
                              src={
                                customer.profileImage ||
                                customer.image
                              }
                              alt={
                                customer?.name ||
                                "Customer"
                              }
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#b65b69] to-[#7d2f3d] text-white flex items-center justify-center text-lg font-bold shadow-md">
                              {customerInitial}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-[9px] tracking-[0.18em] uppercase text-[#BFA996]">
                              My Account
                            </p>

                            <h3 className="mt-1 font-bold text-[#5B3B32] truncate">
                              {customer?.name || "Customer"}
                            </h3>

                            <p className="mt-1 text-xs text-[#8b746b] truncate">
                              {customer?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 text-sm text-[#5B3B32]">
                        <Link
                          to="/profile"
                          className="account-dropdown-link"
                        >
                          <FiUser size={17} />
                          My Profile
                        </Link>

                        <Link
                          to="/my-orders"
                          className="account-dropdown-link"
                        >
                          <FiPackage size={17} />
                          My Orders
                        </Link>

                        <Link
                          to="/wishlist"
                          className="account-dropdown-link"
                        >
                          <FiHeart size={17} />
                          Wishlist
                        </Link>

                        <Link
                          to="/saved-addresses"
                          className="account-dropdown-link"
                        >
                          <FiUser size={17} />
                          Saved Addresses
                        </Link>

                        <Link
                          to="/track-order"
                          className="account-dropdown-link"
                        >
                          <FiPackage size={17} />
                          Track Order
                        </Link>
                      </div>

                      <div className="p-2 border-t border-[#eadbd4]">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut size={17} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>

        {/* Mobile menu */}

        <div
          className={`lg:hidden fixed inset-x-0 top-auto z-40 overflow-hidden transition-all duration-500 ease-out ${
            menuOpen
              ? "visible opacity-100 translate-y-0"
              : "invisible opacity-0 -translate-y-5 pointer-events-none"
          }`}
        >
          <div
            className="fixed inset-0 top-[115px] bg-[#3d2822]/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative max-h-[calc(100vh-110px)] overflow-y-auto border-t border-[#eadbd4] bg-[#fffaf7]/95 backdrop-blur-2xl shadow-2xl">
            <Container>
              <div className="py-6">
                {/* Mobile search */}

                <form
                  onSubmit={handleDesktopSearch}
                  className="flex items-center rounded-full border border-[#e3cec6] bg-white/80 px-4"
                >
                  <FiSearch
                    size={18}
                    className="text-[#9A3F4D]"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search sarees, suits, kurtis..."
                    className="w-full h-12 bg-transparent px-3 text-sm text-[#5B3B32] outline-none placeholder:text-[#aa938a]"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[#8b746b]"
                      aria-label="Clear search"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </form>

                <div className="mt-7 grid gap-1">
                  <MobileNavLink to="/">
                    Home
                  </MobileNavLink>

                  <MobileNavLink to="/products">
                    Collection
                  </MobileNavLink>

                  <div className="grid grid-cols-2 gap-2 px-2 py-3">
                    <MobileCategoryLink
                      to="/products?category=Saree"
                      label="Sarees"
                    />

                    <MobileCategoryLink
                      to="/products?category=Suit"
                      label="Suits"
                    />

                    <MobileCategoryLink
                      to="/products?category=Kurti"
                      label="Kurtis"
                    />

                    <MobileCategoryLink
                      to="/products?category=Lehenga"
                      label="Lehengas"
                    />
                  </div>

                  <MobileNavLink to="/lookbook">
                    Lookbook
                  </MobileNavLink>

                  <MobileNavLink to="/customize">
                    Custom Design
                  </MobileNavLink>

                  <MobileNavLink to="/wishlist">
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto text-xs text-[#9A3F4D]">
                        {wishlistCount}
                      </span>
                    )}
                  </MobileNavLink>

                  <MobileNavLink to="/track-order">
                    Track Order
                  </MobileNavLink>

                  <MobileNavLink to="/about">
                    About
                  </MobileNavLink>

                  <MobileNavLink to="/contact">
                    Contact
                  </MobileNavLink>
                </div>

                <div className="h-px bg-[#eadbd4] my-5" />

                {!isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      className="rounded-full border border-[#9A3F4D] py-3 text-center text-xs font-semibold tracking-[0.15em] uppercase text-[#9A3F4D]"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="rounded-full bg-[#9A3F4D] py-3 text-center text-xs font-semibold tracking-[0.15em] uppercase text-white"
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 rounded-3xl bg-[#f7ece7] p-4">
                      <div className="w-11 h-11 rounded-full bg-[#9A3F4D] text-white flex items-center justify-center font-bold">
                        {customerInitial}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[#5B3B32] truncate">
                          {customer?.name || "Customer"}
                        </p>

                        <p className="text-xs text-[#8b746b] truncate">
                          {customer?.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-1">
                      <MobileNavLink to="/profile">
                        My Profile
                      </MobileNavLink>

                      <MobileNavLink to="/my-orders">
                        My Orders
                      </MobileNavLink>

                      <MobileNavLink to="/saved-addresses">
                        Saved Addresses
                      </MobileNavLink>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-4 w-full rounded-full border border-red-200 bg-red-50 py-3 text-xs font-semibold tracking-[0.15em] uppercase text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </Container>
          </div>
        </div>
      </header>

      {/* Existing search overlay */}

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Existing mini cart drawer */}

      <MiniCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {/* Component-specific styles */}

      <style>{`
        .luxury-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 10px 0;
          transition:
            color 300ms ease,
            transform 300ms ease;
        }

        .luxury-nav-link::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 2px;
          width: 0;
          height: 1.5px;
          border-radius: 999px;
          background: #9A3F4D;
          transform: translateX(-50%);
          transition: width 300ms ease;
        }

        .luxury-nav-link:hover {
          color: #9A3F4D;
          transform: translateY(-1px);
        }

        .luxury-nav-link:hover::after {
          width: 100%;
        }

        .account-dropdown-link {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          padding: 12px 16px;
          transition:
            background-color 250ms ease,
            color 250ms ease,
            transform 250ms ease;
        }

        .account-dropdown-link:hover {
          background: #f6ebe7;
          color: #9A3F4D;
          transform: translateX(2px);
        }
      `}</style>
    </>
  );
}

function MobileNavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="flex items-center rounded-2xl px-4 py-3 text-sm font-semibold tracking-[0.12em] uppercase text-[#5B3B32] hover:bg-[#f6ebe7] hover:text-[#9A3F4D] transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileCategoryLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-[#eadbd4] bg-white/70 px-3 py-3 text-center text-xs font-semibold text-[#5B3B32] hover:border-[#9A3F4D] hover:text-[#9A3F4D] transition-colors"
    >
      {label}
    </Link>
  );
}

export default Navbar;