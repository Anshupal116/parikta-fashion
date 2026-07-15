import { Link } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import FreeShippingProgress from "../components/FreeShippingProgress";
import CouponBox from "../components/CouponBox";

import { useCart } from "../context/CartContext";

function Cart() {
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

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="text-center mb-10">
            <p className="text-[#BFA996] font-semibold tracking-[0.25em]">
              PARIKTA BAG
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              Shopping Bag
            </h1>

            <p className="text-[#8b746b] mt-3">
              {cartCount} item{cartCount !== 1 ? "s" : ""} in your bag
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 rounded-full bg-[#FDEAE6] text-[#9A3F4D] flex items-center justify-center mx-auto">
                <FiShoppingBag size={32} />
              </div>

              <h2 className="heading-font text-4xl text-[#5B3B32] mt-6">
                Your Bag Is Empty
              </h2>

              <p className="text-[#8b746b] mt-3">
                Add your favourite outfits to continue shopping.
              </p>

              <Link to="/products">
                <button className="mt-7 bg-[#9A3F4D] text-white px-8 py-4 rounded-full font-bold hover:bg-[#7d3140]">
                  Continue Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
              <div className="space-y-5">
                {cartItems.map((item) => {
                  const itemTotal =
                    Number(item.price || 0) *
                    Number(item.qty || 1);

                  return (
                    <article
                      key={item.cartItemId}
                      className="bg-[#fffaf7] rounded-3xl border border-[#eadbd4] shadow-sm p-5 flex flex-col sm:flex-row gap-5"
                    >
                      <Link
                        to={`/product/${item.id}`}
                        className="shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full sm:w-40 h-56 sm:h-52 object-cover object-top rounded-2xl bg-[#FDEAE6]"
                        />
                      </Link>

                      <div className="flex-1">
                        <div className="flex justify-between gap-4">
                          <div>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="heading-font text-3xl text-[#5B3B32] hover:text-[#9A3F4D] transition">
                                {item.name}
                              </h3>
                            </Link>

                            <p className="text-[#8b746b] mt-1">
                              {item.type || item.category}
                            </p>
                          </div>

                          <button
                            type="button"
                            aria-label="Remove product"
                            onClick={() =>
                              removeFromCart(item.cartItemId)
                            }
                            className="w-10 h-10 rounded-full border border-[#eadbd4] text-[#8b746b] hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                          <span className="bg-[#FDEAE6] px-4 py-2 rounded-xl text-[#5B3B32]">
                            Size:{" "}
                            <strong>
                              {item.selectedSize || "Free Size"}
                            </strong>
                          </span>

                          <div className="inline-flex items-center border border-[#eadbd4] rounded-xl overflow-hidden bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                decreaseQty(item.cartItemId)
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-[#FDEAE6] transition"
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
                                increaseQty(item.cartItemId)
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-[#FDEAE6] transition"
                            >
                              <FiPlus size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                          <p className="text-3xl font-bold text-[#9A3F4D]">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </p>

                          <p className="text-[#8b746b] text-sm">
                            ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString("en-IN")}{" "}
                            each
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="space-y-5 lg:sticky lg:top-28">
                <div className="bg-[#fffaf7] rounded-3xl border border-[#eadbd4] shadow-sm p-6">
                  <h2 className="heading-font text-3xl text-[#5B3B32]">
                    Price Details
                  </h2>

                  <div className="mt-6">
                    <FreeShippingProgress cartTotal={cartTotal} />
                  </div>

                  <div className="mt-6">
                    <CouponBox />
                  </div>

                  <div className="mt-6 space-y-4 text-[#5B3B32]">
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
                      <span>Coupon Discount</span>

                      <span className="text-green-600 font-semibold">
                        -₹
                        {discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Delivery Charges</span>

                      <span className="text-green-600 font-semibold">
                        Free
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#eadbd4] mt-6 pt-6 flex justify-between text-2xl font-bold text-[#5B3B32]">
                    <span>Total</span>

                    <span>
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="text-xs text-[#8b746b] mt-2">
                    Inclusive of all taxes.
                  </p>

                  <Link to="/checkout">
                    <button className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold mt-6 hover:bg-[#7d3140] transition">
                      PROCEED TO CHECKOUT
                    </button>
                  </Link>

                  <Link to="/products">
                    <button className="w-full border-2 border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold mt-3 hover:bg-[#FDEAE6] transition">
                      CONTINUE SHOPPING
                    </button>
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Cart;