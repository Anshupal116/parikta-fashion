import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, removeFromCart } = useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

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
              {cartItems.length} item(s) in your bag
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-12 text-center shadow-sm">
              <h2 className="heading-font text-3xl text-[#5B3B32]">
                Your bag is empty
              </h2>

              <p className="text-[#8b746b] mt-2">
                Add your favourite outfits to continue shopping.
              </p>

              <Link to="/products">
                <button className="mt-6 bg-[#9A3F4D] text-white px-8 py-3 rounded-full font-bold hover:bg-[#7d3140]">
                  Continue Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
              <div className="space-y-5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#fffaf7] rounded-3xl border border-[#eadbd4] shadow-sm p-5 flex flex-col sm:flex-row gap-5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-40 h-56 sm:h-52 object-cover rounded-2xl bg-[#FDEAE6]"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="heading-font text-3xl text-[#5B3B32]">
                            {item.name}
                          </h3>

                          <p className="text-[#8b746b] mt-1">
                            {item.type}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#8b746b] hover:text-red-500 text-3xl"
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                        <span className="bg-[#FDEAE6] px-4 py-2 rounded-xl text-[#5B3B32]">
                          Size: Free Size
                        </span>

                        <span className="bg-[#FDEAE6] px-4 py-2 rounded-xl text-[#5B3B32]">
                          Qty: {item.qty}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <p className="text-3xl font-bold text-[#9A3F4D]">
                          ₹{item.price * item.qty}
                        </p>

                        <p className="text-[#8b746b] text-sm">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="bg-[#fffaf7] rounded-3xl border border-[#eadbd4] shadow-sm p-6 lg:sticky lg:top-28">
                <h2 className="heading-font text-3xl text-[#5B3B32]">
                  Price Details
                </h2>

                <div className="mt-6 space-y-4 text-[#5B3B32]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-semibold">
                      Free
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-green-600">₹0</span>
                  </div>
                </div>

                <div className="border-t border-[#eadbd4] mt-6 pt-6 flex justify-between text-2xl font-bold text-[#5B3B32]">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>

                <Link to="/checkout">
                  <button className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold mt-6 hover:bg-[#7d3140]">
                    PLACE ORDER
                  </button>
                </Link>

                <Link to="/products">
                  <button className="w-full border-2 border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold mt-3 hover:bg-[#FDEAE6]">
                    CONTINUE SHOPPING
                  </button>
                </Link>
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