import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiArrowLeft,
  FiLock,
  FiRefreshCw,
  FiTruck,
  FiX,
  FiHeart,
  FiShield,
  FiAward,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import FreeShippingProgress from "../components/FreeShippingProgress";
import CouponBox from "../components/CouponBox";

import { useCart } from "../context/CartContext";

function Cart() {
  const [removeItemId, setRemoveItemId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = removeItemId ? "hidden" : "";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setRemoveItemId(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [removeItemId]);

  const {
    cartItems,
    cartCount,
    cartTotal,
    discountAmount,
    finalTotal,
    removeFromCart,
    increaseQty,
    decreaseQty,
  } = useCart();

  const totalMrp = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.mrp || item.price || 0) * Number(item.qty || 1),
    0
  );

  const productSavings = Math.max(0, totalMrp - cartTotal);
  const totalSavings = productSavings + Number(discountAmount || 0);

  const itemToRemove = cartItems.find(
    (item) => item.cartItemId === removeItemId
  );

  const confirmRemove = () => {
    if (!removeItemId) return;
    removeFromCart(removeItemId);
    setRemoveItemId(null);
  };

  const getDiscountPercent = (item) => {
    const mrp = Number(item.mrp || 0);
    const price = Number(item.price || 0);

    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f4f1] pb-36 pt-4 sm:pt-6 md:py-12 lg:pb-14">
        <Container>
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-start justify-between gap-3 sm:mb-7 md:mb-10">
              <div className="text-left">
                <p className="hidden text-[#BFA996] font-semibold tracking-[0.25em] md:block">
                  PARIKTA BAG
                </p>

                <div className="flex items-center gap-3">
                  <h1 className="heading-font text-[2.15rem] leading-none text-[#2f2623] sm:text-[2.5rem] md:mt-3 md:text-5xl">
                    My Cart ({cartCount})
                  </h1>

                  {cartItems.length > 0 && (
                    <span className="hidden items-center gap-2 rounded-full border border-[#eadbd4] bg-white px-4 py-2 text-xs font-semibold text-[#6d574f] md:flex">
                      <FiShield className="text-[#9A3F4D]" />
                      100% SECURE
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-[#8b746b] md:text-base">
                  Review your selected items
                </p>
              </div>

              {cartItems.length > 0 && (
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#eadbd4] bg-white px-2.5 py-2 text-[10px] font-semibold text-[#6d574f] md:hidden">
                  <FiShield className="text-[#9A3F4D]" />
                  SECURE
                </div>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] px-5 py-10 text-center shadow-sm sm:p-8 md:rounded-3xl md:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]">
                  <FiShoppingBag size={32} />
                </div>

                <h2 className="heading-font mt-6 text-[2.15rem] leading-tight text-[#5B3B32] sm:text-4xl">
                  Your Bag Is Empty
                </h2>

                <p className="mt-3 text-[#8b746b]">
                  Add your favourite outfits to continue shopping.
                </p>

                <Link to="/products">
                  <button className="mt-7 min-h-12 w-full rounded-full bg-[#9A3F4D] px-8 py-4 font-bold text-white transition active:scale-[0.98] hover:bg-[#7d3140] sm:w-auto">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-2xl border border-[#eadbd4] bg-[#fffdfb] p-3.5 shadow-sm sm:mb-5 sm:p-4 md:p-5">
                  <FreeShippingProgress cartTotal={cartTotal} />
                </div>

                <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-7">
                  <div className="min-w-0 space-y-3.5 sm:space-y-4">
                    {cartItems.map((item) => {
                      const itemTotal =
                        Number(item.price || 0) * Number(item.qty || 1);

                      const discountPercent = getDiscountPercent(item);

                      return (
                        <article
                          key={item.cartItemId}
                          className="min-w-0 overflow-hidden rounded-[22px] border border-[#eadbd4] bg-[#fffdfb] p-3 shadow-[0_10px_30px_rgba(91,59,50,0.06)] sm:p-4 md:rounded-3xl md:p-5"
                        >
                          <div className="flex min-w-0 gap-3 md:gap-5">
                            <Link
                              to={`/product/${item.id}`}
                              className="shrink-0 overflow-hidden rounded-2xl"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-36 w-24 max-w-full rounded-2xl bg-[#FDEAE6] object-cover object-top transition-transform duration-500 hover:scale-105 min-[390px]:h-40 min-[390px]:w-28 sm:h-48 sm:w-36 md:h-56 md:w-40"
                              />
                            </Link>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <Link to={`/product/${item.id}`}>
                                    <h3 className="heading-font line-clamp-2 break-words text-[1.05rem] leading-snug text-[#2f2623] transition hover:text-[#9A3F4D] min-[390px]:text-[1.2rem] sm:text-2xl md:text-3xl">
                                      {item.name}
                                    </h3>
                                  </Link>

                                  <p className="mt-1 text-xs text-[#8b746b] sm:text-sm">
                                    {item.type || item.category || "Ethnic Wear"}
                                  </p>

                                  <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-[#6f5a52] sm:gap-2 sm:text-xs">
                                    <span>{item.color || "Premium"}</span>
                                    <span>•</span>
                                    <span>
                                      Size {item.selectedSize || "Free Size"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex shrink-0 flex-col gap-2">
                                  <button
                                    type="button"
                                    aria-label="Remove product"
                                    onClick={() =>
                                      setRemoveItemId(item.cartItemId)
                                    }
                                    className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl border border-[#eadbd4] bg-white text-[#7a645b] transition active:scale-95 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    aria-label="Move to wishlist"
                                    className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl border border-[#eadbd4] bg-white text-[#7a645b] transition active:scale-95 hover:bg-[#FDEAE6] hover:text-[#9A3F4D]"
                                  >
                                    <FiHeart size={16} />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                                <p className="font-bold text-[#9A3F4D] sm:text-lg">
                                  ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                </p>

                                {Number(item.mrp || 0) >
                                  Number(item.price || 0) && (
                                  <>
                                    <p className="text-xs text-[#9f918b] line-through sm:text-sm">
                                      ₹{Number(item.mrp).toLocaleString("en-IN")}
                                    </p>

                                    {discountPercent > 0 && (
                                      <span className="text-xs font-semibold text-[#c38b24]">
                                        ({discountPercent}% OFF)
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="mt-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
                                <div className="inline-flex shrink-0 items-center overflow-hidden rounded-xl border border-[#dfd1ca] bg-white">
                                  <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() =>
                                      decreaseQty(item.cartItemId)
                                    }
                                    className="flex h-11 w-11 touch-manipulation items-center justify-center transition hover:bg-[#FDEAE6] active:scale-95"
                                  >
                                    <FiMinus size={14} />
                                  </button>

                                  <span className="w-8 text-center text-sm font-bold text-[#5B3B32] sm:w-9">
                                    {item.qty}
                                  </span>

                                  <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() =>
                                      increaseQty(item.cartItemId)
                                    }
                                    className="flex h-11 w-11 touch-manipulation items-center justify-center transition hover:bg-[#FDEAE6] active:scale-95"
                                  >
                                    <FiPlus size={14} />
                                  </button>
                                </div>

                                <p className="text-right font-bold text-[#2f2623] sm:text-lg">
                                  ₹{itemTotal.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <aside className="hidden min-w-0 space-y-5 lg:sticky lg:top-28 lg:block lg:h-fit">
                    <div className="rounded-3xl border border-[#eadbd4] bg-[#fffdfb] p-5 shadow-[0_10px_30px_rgba(91,59,50,0.06)] md:p-6">
                      <h2 className="heading-font text-3xl text-[#5B3B32]">
                        Price Details
                      </h2>

                      <div className="mt-5">
                        <CouponBox />
                      </div>

                      <div className="mt-6 space-y-4 text-sm text-[#5B3B32]">
                        <div className="flex justify-between">
                          <span>
                            Subtotal ({cartCount} item
                            {cartCount !== 1 ? "s" : ""})
                          </span>

                          <span className="font-semibold">
                            ₹{cartTotal.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="font-semibold text-green-600">
                            Free
                          </span>
                        </div>

                        {discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Coupon Discount</span>
                            <span className="font-semibold text-green-600">
                              -₹{discountAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}

                        {productSavings > 0 && (
                          <div className="flex justify-between">
                            <span>Product Savings</span>
                            <span className="font-semibold text-green-600">
                              -₹{productSavings.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-between border-t border-[#eadbd4] pt-5 text-2xl font-bold text-[#5B3B32]">
                        <span>Grand Total</span>
                        <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                      </div>

                      {totalSavings > 0 && (
                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                          You saved ₹{totalSavings.toLocaleString("en-IN")} on
                          this order
                        </div>
                      )}

                      <p className="mt-3 text-xs text-[#8b746b]">
                        Inclusive of all taxes.
                      </p>

                      <Link to="/checkout/address">
                        <button className="mt-6 hidden w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#7d3140] hover:shadow-xl active:translate-y-0 lg:block">
                          PROCEED TO CHECKOUT
                        </button>
                      </Link>

                      <Link to="/products">
                        <button className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl border-2 border-[#9A3F4D] py-4 font-bold text-[#9A3F4D] transition hover:-translate-y-0.5 hover:bg-[#FDEAE6] active:translate-y-0 lg:flex">
                          <FiArrowLeft />
                          CONTINUE SHOPPING
                        </button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        [FiLock, "Secure Payment", "100% safe"],
                        [FiRefreshCw, "Easy Returns", "Hassle free"],
                        [FiAward, "Premium Quality", "Finest fabrics"],
                        [FiTruck, "Fast Delivery", "Pan India"],
                      ].map(([Icon, label, sublabel]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-[#eadbd4] bg-[#fffdfb] p-4"
                        >
                          <Icon size={18} className="text-[#9A3F4D]" />
                          <p className="mt-2 text-xs font-bold text-[#5B3B32]">
                            {label}
                          </p>
                          <p className="mt-1 text-[10px] text-[#8b746b]">
                            {sublabel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </aside>
                </div>

                <div className="mt-5 space-y-4 lg:hidden">
                  <div className="rounded-2xl border border-[#eadbd4] bg-[#fffdfb] p-4 shadow-sm">
                    <CouponBox />
                  </div>

                  <div className="rounded-2xl border border-[#eadbd4] bg-[#fffdfb] p-4 shadow-sm">
                    <div className="space-y-3 text-sm text-[#5B3B32]">
                      <div className="flex justify-between">
                        <span>
                          Subtotal ({cartCount} item
                          {cartCount !== 1 ? "s" : ""})
                        </span>
                        <span className="font-semibold">
                          ₹{cartTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-semibold text-green-600">
                          Free
                        </span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between gap-3">
                          <span>Coupon Discount</span>
                          <span className="shrink-0 font-semibold text-green-600">
                            -₹{discountAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {productSavings > 0 && (
                        <div className="flex justify-between gap-3">
                          <span>Product Savings</span>
                          <span className="shrink-0 font-semibold text-green-600">
                            -₹{productSavings.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between gap-3 border-t border-[#eadbd4] pt-4 text-xl font-bold text-[#5B3B32]">
                      <span>Grand Total</span>
                      <span className="shrink-0">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                        You saved ₹{totalSavings.toLocaleString("en-IN")} on this order
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      [FiLock, "Secure Payment"],
                      [FiRefreshCw, "Easy Returns"],
                      [FiAward, "Premium Quality"],
                      [FiTruck, "Fast Delivery"],
                    ].map(([Icon, label]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-[#eadbd4] bg-[#fffdfb] px-3 py-4 text-center"
                      >
                        <Icon
                          size={18}
                          className="mx-auto text-[#9A3F4D]"
                        />
                        <p className="mt-2 text-[11px] font-semibold text-[#5B3B32]">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link to="/products">
                    <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#9A3F4D] bg-white py-4 font-bold text-[#9A3F4D]">
                      <FiArrowLeft />
                      CONTINUE SHOPPING
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Container>
      </main>

      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-[#eadbd4] bg-[#fffdfb]/96 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(91,59,50,0.12)] backdrop-blur-md lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr] items-center gap-2.5">
            <div className="min-w-[88px] shrink-0">
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8b746b]">
                Total
              </p>
              <p className="text-base font-bold text-[#9A3F4D] sm:text-lg">
                ₹{finalTotal.toLocaleString("en-IN")}
              </p>
            </div>

            <Link to="/checkout/address" className="min-w-0">
              <button className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#9A3F4D] px-3 py-3 text-[11px] font-bold text-white transition active:scale-[0.98] hover:bg-[#7d3140] sm:text-sm">
                <FiLock size={15} />
                CHECKOUT
              </button>
            </Link>
          </div>
        </div>
      )}

      {removeItemId && itemToRemove && (
        <div
          className="fixed inset-0 z-[10060] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setRemoveItemId(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-[#eadbd4] bg-[#fffaf7] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
                  Remove Item
                </p>
                <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                  Are You Sure?
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setRemoveItemId(null)}
                className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-[#FDEAE6] text-[#5B3B32] active:scale-95"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#eadbd4] bg-white p-3">
              <img
                src={itemToRemove.image}
                alt={itemToRemove.name}
                className="h-24 w-20 rounded-xl bg-[#FDEAE6] object-cover object-top"
              />

              <div className="min-w-0">
                <h3 className="heading-font truncate text-2xl text-[#5B3B32]">
                  {itemToRemove.name}
                </h3>
                <p className="mt-1 text-sm text-[#8b746b]">
                  Size: {itemToRemove.selectedSize || "Free Size"}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#8b746b]">
              This product will be removed from your shopping bag.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRemoveItemId(null)}
                className="min-h-12 rounded-xl border border-[#9A3F4D] py-3 font-bold text-[#9A3F4D] transition active:scale-[0.98] hover:bg-[#FDEAE6]"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={confirmRemove}
                className="min-h-12 rounded-xl bg-red-600 py-3 font-bold text-white transition active:scale-[0.98] hover:bg-red-700"
              >
                REMOVE
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Cart;