import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiTruck,
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
      {
        label: "Wedding Wear",
        to: "/products?occasion=Wedding",
      },
      {
        label: "Festive Wear",
        to: "/products?occasion=Festive",
      },
      {
        label: "Party Wear",
        to: "/products?occasion=Party",
      },
      {
        label: "Everyday Wear",
        to: "/products?occasion=Casual",
      },
    ],
  },
  {
    title: "Featured",
    links: [
      {
        label: "New Arrivals",
        to: "/products?sort=newest",
      },
      {
        label: "Best Sellers",
        to: "/products?sort=best-selling",
      },
      {
        label: "Premium Collection",
        to: "/products?badge=Premium",
      },
      {
        label: "Sale",
        to: "/products?discount=true",
      },
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
  const [mobileCollectionOpen, setMobileCollectionOpen] =
    useState(false);

  const [desktopSearchOpen, setDesktopSearchOpen] =
    useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] =
    useState(false);
  const [showWishlistMenu, setShowWishlistMenu] =
    useState(false);
  const [showMegaMenu, setShowMegaMenu] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileCollectionOpen(false);
    setShowAccountMenu(false);
    setShowWishlistMenu(false);
    setShowMegaMenu(false);
    setDesktopSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!desktopSearchOpen) return undefined;

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [desktopSearchOpen]);

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

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logoutCustomer();

    setShowAccountMenu(false);
    setMenuOpen(false);
    setMobileCollectionOpen(false);

    navigate("/");
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchQuery.trim();

    if (!value) return;

    navigate(
      `/products?search=${encodeURIComponent(value)}`
    );

    setSearchQuery("");
    setDesktopSearchOpen(false);
    setMenuOpen(false);
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

  const customerImage =
    customer?.profileImage || customer?.image || "";

  return (
    <>
      {/* FIXED NAVBAR */}

      <div className="fixed inset-x-0 top-0 z-[9999]">
        <AnnouncementBar />

        <header
          className={`relative w-full border-b transition-all duration-500 ${
            scrolled
              ? "border-[#e4d2ca]/80 bg-[#fffaf7]/78 shadow-[0_12px_45px_rgba(71,43,35,0.13)] backdrop-blur-2xl"
              : "border-[#eadbd4]/60 bg-[#fffaf7]/95 shadow-[0_4px_20px_rgba(71,43,35,0.05)] backdrop-blur-xl"
          }`}
        >
          <Container>
            <div
              className={`flex items-center justify-between gap-3 transition-all duration-500 ${
                scrolled
                  ? "h-[64px] md:h-[70px]"
                  : "h-[76px] md:h-[86px]"
              }`}
            >
              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() =>
                  setMenuOpen((previous) => !previous)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#5B3B32] transition-all duration-300 hover:bg-[#f4e7e1] hover:text-[#9A3F4D] lg:hidden"
                aria-label="Open navigation menu"
              >
                {menuOpen ? (
                  <FiX size={23} />
                ) : (
                  <FiMenu size={23} />
                )}
              </button>

              {/* DESKTOP LEFT MENU */}

              <nav className="hidden flex-1 items-center lg:flex">
                <ul className="flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B3B32] xl:gap-9">
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
                      className={`absolute left-0 top-full pt-5 transition-all duration-300 ${
                        showMegaMenu
                          ? "visible translate-y-0 opacity-100"
                          : "invisible -translate-y-3 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="w-[720px] overflow-hidden rounded-[28px] border border-[#eadbd4] bg-[#fffaf7]/96 shadow-[0_25px_80px_rgba(74,44,35,0.2)] backdrop-blur-2xl">
                        <div className="grid grid-cols-3 gap-8 p-8">
                          {megaMenuCategories.map(
                            (section) => (
                              <div key={section.title}>
                                <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.21em] text-[#9A3F4D]">
                                  {section.title}
                                </h3>

                                <div className="space-y-3.5">
                                  {section.links.map(
                                    (item) => (
                                      <Link
                                        key={item.label}
                                        to={item.to}
                                        className="block text-sm font-medium normal-case tracking-normal text-[#5B3B32] transition-all duration-300 hover:translate-x-1 hover:text-[#9A3F4D]"
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

                        <div className="flex items-center justify-between border-t border-[#eadbd4] bg-gradient-to-r from-[#f8ebe5] to-[#fffaf7] px-8 py-5">
                          <div>
                            <p className="text-sm font-semibold normal-case tracking-normal text-[#5B3B32]">
                              Discover the complete Parikta
                              collection
                            </p>

                            <p className="mt-1 text-xs normal-case tracking-normal text-[#917b72]">
                              Luxury designs selected for every
                              occasion.
                            </p>
                          </div>

                          <Link
                            to="/products"
                            className="rounded-full bg-[#9A3F4D] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#7e303d]"
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

              {/* LOGO */}

              <Link
                to="/"
                className="group shrink-0 text-center leading-none"
                aria-label="Parikta Fashion Home"
              >
                <div
                  className={`logo-font text-[#9A3F4D] transition-all duration-500 ${
                    scrolled
                      ? "text-[39px] md:text-[47px]"
                      : "text-[47px] md:text-[58px]"
                  }`}
                >
                  Parikta
                </div>

                <div
                  className={`font-semibold text-[#BFA996] transition-all duration-500 ${
                    scrolled
                      ? "text-[7px] tracking-[0.34em] md:text-[8px]"
                      : "text-[8px] tracking-[0.42em] md:text-[10px]"
                  }`}
                >
                  FASHION
                </div>
              </Link>

              {/* DESKTOP RIGHT MENU */}

              <nav className="hidden flex-1 items-center justify-end lg:flex">
                <ul className="flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B3B32] xl:gap-9">
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

              {/* RIGHT ICONS */}

              <div className="flex items-center justify-end gap-1 text-[#5B3B32] sm:gap-2">
                {/* DESKTOP SEARCH */}

                <form
                  onSubmit={handleSearch}
                  className={`hidden items-center overflow-hidden rounded-full border transition-all duration-500 md:flex ${
                    desktopSearchOpen
                      ? "w-52 border-[#d7bdb4] bg-white/85 shadow-sm xl:w-60"
                      : "w-10 border-transparent bg-transparent"
                  }`}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search..."
                    className={`h-10 bg-transparent text-sm text-[#5B3B32] outline-none placeholder:text-[#a58e85] transition-all duration-500 ${
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#f5e9e4] hover:text-[#9A3F4D]"
                    aria-label="Search products"
                  >
                    <FiSearch size={19} />
                  </button>
                </form>

                {/* MOBILE SEARCH */}

                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#f5e9e4] hover:text-[#9A3F4D] md:hidden"
                  aria-label="Search products"
                >
                  <FiSearch size={19} />
                </button>

                {/* WISHLIST */}

                <div
                  ref={wishlistMenuRef}
                  className="relative hidden sm:block"
                >
                  <button
                    type="button"
                    onClick={toggleWishlistMenu}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#f5e9e4] hover:text-[#9A3F4D]"
                    aria-label="Wishlist"
                  >
                    <FiHeart size={19} />

                    {wishlistCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#9A3F4D] px-1 text-[9px] font-bold text-white">
                        {wishlistCount > 99
                          ? "99+"
                          : wishlistCount}
                      </span>
                    )}
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-4 w-72 overflow-hidden rounded-[24px] border border-[#eadbd4] bg-[#fffaf7]/97 shadow-[0_24px_70px_rgba(74,44,35,0.18)] backdrop-blur-2xl transition-all duration-300 ${
                      showWishlistMenu
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-3 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="border-b border-[#eadbd4] p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#5B3B32]">
                          Wishlist
                        </h3>

                        <span className="text-xs font-semibold text-[#9A3F4D]">
                          {wishlistCount} items
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-7 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5e9e4] text-[#9A3F4D]">
                        <FiHeart size={23} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-[#5B3B32]">
                        {wishlistCount > 0
                          ? "Your favourite styles are waiting"
                          : "Your wishlist is empty"}
                      </p>

                      <Link
                        to="/wishlist"
                        className="mt-5 flex w-full items-center justify-center rounded-full bg-[#9A3F4D] py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#7e303d]"
                      >
                        View Wishlist
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CART */}

                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#f5e9e4] hover:text-[#9A3F4D]"
                  aria-label="Shopping bag"
                >
                  <FiShoppingBag size={19} />

                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#9A3F4D] px-1 text-[9px] font-bold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>

                {/* PROFILE ICON AND DROPDOWN */}

                <div
                  ref={accountMenuRef}
                  className="relative"
                >
                  {!isLoggedIn ? (
                    <Link
                      to="/login"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfccc4] bg-white/75 transition-all duration-300 hover:border-[#9A3F4D] hover:bg-[#f8ece7] hover:text-[#9A3F4D]"
                      aria-label="Login"
                    >
                      <FiUser size={18} />
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={toggleAccountMenu}
                        className={`flex items-center gap-2 rounded-full border p-1 transition-all duration-300 ${
                          showAccountMenu
                            ? "border-[#9A3F4D] bg-[#f7eae5] shadow-md"
                            : "border-transparent hover:border-[#e1cec6] hover:bg-white/75"
                        }`}
                        aria-label="Open account menu"
                      >
                        {customerImage ? (
                          <img
                            src={customerImage}
                            alt={
                              customer?.name || "Customer"
                            }
                            className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#b45b69] to-[#792d3a] text-xs font-bold text-white shadow-md">
                            {customerInitial}
                          </div>
                        )}

                        <FiChevronDown
                          size={13}
                          className={`mr-1 hidden transition-transform duration-300 xl:block ${
                            showAccountMenu
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`absolute right-0 top-full mt-4 w-[300px] overflow-hidden rounded-[28px] border border-[#e6d4cc] bg-[#fffaf7]/98 shadow-[0_28px_90px_rgba(66,38,30,0.24)] backdrop-blur-2xl transition-all duration-300 ${
                          showAccountMenu
                            ? "visible translate-y-0 scale-100 opacity-100"
                            : "invisible -translate-y-4 scale-[0.97] opacity-0 pointer-events-none"
                        }`}
                      >
                        {/* PROFILE HEADER */}

                        <div className="relative overflow-hidden border-b border-[#eadbd4] bg-gradient-to-br from-[#f5dfd8] via-[#fff5f1] to-[#fffaf7] p-5">
                          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#9A3F4D]/10 blur-2xl" />

                          <div className="relative flex items-center gap-4">
                            {customerImage ? (
                              <img
                                src={customerImage}
                                alt={
                                  customer?.name ||
                                  "Customer"
                                }
                                className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-lg"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#b45b69] to-[#792d3a] text-xl font-bold text-white shadow-lg">
                                {customerInitial}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b18a7d]">
                                Welcome Back
                              </p>

                              <h3 className="mt-1 truncate text-base font-bold text-[#5B3B32]">
                                {customer?.name ||
                                  "Customer"}
                              </h3>

                              <p className="mt-1 truncate text-xs text-[#8f786f]">
                                {customer?.email ||
                                  customer?.mobile}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ACCOUNT OPTIONS */}

                        <div className="p-2.5">
                          <AccountMenuLink
                            to="/profile"
                            icon={<FiUser size={18} />}
                            title="My Profile"
                            description="Manage your account details"
                          />

                          <AccountMenuLink
                            to="/my-orders"
                            icon={<FiPackage size={18} />}
                            title="My Orders"
                            description="View and manage your orders"
                          />

                          <AccountMenuLink
                            to="/track-order"
                            icon={<FiTruck size={18} />}
                            title="Track Order"
                            description="Check your delivery status"
                          />

                          <AccountMenuLink
                            to="/wishlist"
                            icon={<FiHeart size={18} />}
                            title="My Wishlist"
                            description="View your favourite products"
                          />

                          <AccountMenuLink
                            to="/saved-addresses"
                            icon={<FiMapPin size={18} />}
                            title="Saved Addresses"
                            description="Manage delivery addresses"
                          />
                        </div>

                        {/* LOGOUT */}

                        <div className="border-t border-[#eadbd4] p-2.5">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 hover:bg-red-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition group-hover:bg-red-100">
                              <FiLogOut size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-red-600">
                                Logout
                              </p>

                              <p className="mt-0.5 text-[11px] text-red-400">
                                Sign out from your account
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </header>
      </div>

      {/* FIXED HEADER SPACE — GAP FIXED */}

      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "h-[92px] md:h-[98px]"
            : "h-[104px] md:h-[114px]"
        }`}
      />

      {/* MOBILE MENU */}

      <div
        className={`fixed inset-x-0 bottom-0 z-[9998] transition-all duration-500 lg:hidden ${
          scrolled
            ? "top-[92px] md:top-[98px]"
            : "top-[104px] md:top-[114px]"
        } ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-[#3b2721]/30 backdrop-blur-sm"
          aria-label="Close menu"
        />

        <div className="relative max-h-full overflow-y-auto border-t border-[#eadbd4] bg-[#fffaf7]/98 shadow-2xl backdrop-blur-2xl">
          <Container>
            <div className="py-6">
              <form
                onSubmit={handleSearch}
                className="flex items-center rounded-full border border-[#e3cec6] bg-white/85 px-4"
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
                  placeholder="Search products..."
                  className="h-12 w-full bg-transparent px-3 text-sm text-[#5B3B32] outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                  >
                    <FiX size={18} />
                  </button>
                )}
              </form>

              <div className="mt-6 grid gap-1">
                <MobileNavLink to="/">
                  Home
                </MobileNavLink>

                {/* MOBILE COLLECTION DROPDOWN */}

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileCollectionOpen(
                        (previous) => !previous
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition ${
                      mobileCollectionOpen
                        ? "bg-[#f5e6e0] text-[#9A3F4D]"
                        : "text-[#5B3B32] hover:bg-[#f5e6e0]"
                    }`}
                  >
                    Collection

                    <FiChevronDown
                      size={19}
                      className={`transition-transform duration-300 ${
                        mobileCollectionOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      mobileCollectionOpen
                        ? "mt-2 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 px-2 pb-3">
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

                        <MobileCategoryLink
                          to="/products?occasion=Wedding"
                          label="Wedding"
                        />

                        <MobileCategoryLink
                          to="/products?occasion=Festive"
                          label="Festive"
                        />

                        <MobileCategoryLink
                          to="/products?sort=newest"
                          label="New Arrivals"
                        />

                        <MobileCategoryLink
                          to="/products?discount=true"
                          label="Sale"
                        />
                      </div>

                      <Link
                        to="/products"
                        className="mx-2 mb-3 flex items-center justify-center rounded-full bg-[#9A3F4D] py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-white"
                      >
                        View All Collection
                      </Link>
                    </div>
                  </div>
                </div>

                <MobileNavLink to="/lookbook">
                  Lookbook
                </MobileNavLink>

                <MobileNavLink to="/customize">
                  Custom Design
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

              <div className="my-5 h-px bg-[#eadbd4]" />

              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="rounded-full border border-[#9A3F4D] py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-[#9A3F4D]"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full bg-[#9A3F4D] py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 rounded-3xl bg-[#f5e6e0] p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#9A3F4D] font-bold text-white">
                      {customerInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#5B3B32]">
                        {customer?.name || "Customer"}
                      </p>

                      <p className="truncate text-xs text-[#8b746b]">
                        {customer?.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-1">
                    <MobileNavLink to="/profile">
                      My Profile
                    </MobileNavLink>

                    <MobileNavLink to="/my-orders">
                      My Orders
                    </MobileNavLink>

                    <MobileNavLink to="/track-order">
                      Track Order
                    </MobileNavLink>

                    <MobileNavLink to="/wishlist">
                      Wishlist
                    </MobileNavLink>

                    <MobileNavLink to="/saved-addresses">
                      Saved Addresses
                    </MobileNavLink>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 w-full rounded-full border border-red-200 bg-red-50 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </Container>
        </div>
      </div>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <MiniCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <style>{`
        .luxury-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 10px 0;
          transition: color 300ms ease, transform 300ms ease;
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
      `}</style>
    </>
  );
}

function AccountMenuLink({
  to,
  icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 hover:bg-[#f5e7e1]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6ebe7] text-[#9A3F4D] transition-all duration-300 group-hover:bg-[#9A3F4D] group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#5B3B32] transition group-hover:text-[#9A3F4D]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-[#9a837a]">
          {description}
        </p>
      </div>
    </Link>
  );
}

function MobileNavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="flex items-center rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#5B3B32] transition hover:bg-[#f5e6e0] hover:text-[#9A3F4D]"
    >
      {children}
    </Link>
  );
}

function MobileCategoryLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-[#eadbd4] bg-white/75 px-3 py-3 text-center text-xs font-semibold text-[#5B3B32] transition hover:border-[#9A3F4D] hover:text-[#9A3F4D]"
    >
      {label}
    </Link>
  );
}

export default Navbar;