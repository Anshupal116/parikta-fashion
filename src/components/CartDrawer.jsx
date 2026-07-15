import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import FreeShippingProgress from "./FreeShippingProgress";

function CartDrawer() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [closeCart]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[500]">
      <button
        type="button"
        aria-label="Close cart drawer"
        onClick={closeCart}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />

      <aside className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-[#fffaf7] shadow-2xl flex flex-col animate-[cartSlide_0.3s_ease-out]">
        <header className="px-5 md:px-6 py-5 border-b border-[#eadbd4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FDEAE6] text-[#9A3F4D] flex items-center justify-center">
              <FiShoppingBag size={21} />
            </div>

            <div>
              <p className="text-xs tracking-[0.18em] uppercase text-[#BFA996]">
                Your Shopping Bag
              </p>

              <h2 className="heading-font text-3xl text-[#5B3B32]">
                Cart ({cartCount})
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="w-11 h-11 rounded-full border border-[#eadbd4] text-[#5B3B32] flex items-center justify-center hover:bg-[#FDEAE6]"
          >
            <FiX size={22} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#FDEAE6] text-[#9A3F4D] flex items-center justify-center mx-auto">
                <FiShoppingBag size={32} />
              </div>

              <h3 className="heading-font text-4xl text-[#5B3B32] mt-6">
                Your Cart Is Empty
              </h3>

              <p className="text-[#8b746b] mt-3">
                Add something beautiful to your bag.
              </p>

              <Link
                to="/products"
                onClick={closeCart}
                className="inline-flex mt-7 bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 md:px-6 pt-5">
              <FreeShippingProgress
                cartTotal={cartTotal}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-5">
              {cartItems.map((item) => (
                <article
                  key={item.cartItemId}
                  className="flex gap-4 border-b border-[#eadbd4] pb-5"
                >
                  <Link
                    to={`/product/${item.id}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-32 object-cover object-top rounded-2xl bg-[#FDEAE6]"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          onClick={closeCart}
                        >
                          <h3 className="font-bold text-[#5B3B32] leading-5 line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>

                        <p className="text-sm text-[#8b746b] mt-2">
                          Size:{" "}
                          <span className="font-semibold text-[#5B3B32]">
                            {item.selectedSize ||
                              "Free Size"}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="Remove product"
                        onClick={() =>
                          removeFromCart(
                            item.cartItemId
                          )
                        }
                        className="text-[#8b746b] hover:text-red-600 shrink-0"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-5">
                      <div className="inline-flex items-center border border-[#eadbd4] rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            decreaseQty(
                              item.cartItemId
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-[#FDEAE6]"
                        >
                          <FiMinus size={15} />
                        </button>

                        <span className="w-10 text-center font-bold text-[#5B3B32]">
                          {item.qty}
                        </span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            increaseQty(
                              item.cartItemId
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-[#FDEAE6]"
                        >
                          <FiPlus size={15} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#9A3F4D] text-lg">
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.qty || 1)
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="text-xs text-[#8b746b]">
                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString("en-IN")}{" "}
                          each
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="border-t border-[#eadbd4] bg-[#fffaf7] px-5 md:px-6 py-5 shadow-[0_-10px_30px_rgba(91,59,50,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase text-[#8b746b]">
                    Subtotal
                  </p>

                  <p className="heading-font text-4xl text-[#9A3F4D] mt-1">
                    ₹
                    {cartTotal.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <p className="text-xs text-[#8b746b] text-right">
                  Taxes included
                  <br />
                  Shipping at checkout
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="border border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl text-center font-bold"
                >
                  View Cart
                </Link>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="bg-[#9A3F4D] text-white py-4 rounded-xl font-bold hover:bg-[#7d3140]"
                >
                  Checkout
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;