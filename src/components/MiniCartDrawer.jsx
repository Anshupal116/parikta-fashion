import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function MiniCartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart } = useCart();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[140] transition ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] bg-[#fffaf7] z-[150] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#eadbd4]">
          <h2 className="heading-font text-3xl text-[#5B3B32]">
            Your Bag
          </h2>

          <button
            onClick={onClose}
            className="text-3xl text-[#5B3B32]"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-180px)]">
          {cartItems.length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-[#6d554d]">
                Your bag is empty
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border border-[#eadbd4] rounded-2xl p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-[#5B3B32] text-sm">
                      {item.name}
                    </h3>

                    <p className="text-[#9A3F4D] font-bold mt-1">
                      ₹{item.price}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-xs mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#eadbd4] p-5 bg-[#fffaf7]">
          <div className="flex justify-between mb-4">
            <span className="font-semibold text-[#5B3B32]">
              Subtotal
            </span>

            <span className="font-bold text-[#9A3F4D]">
              ₹{subtotal}
            </span>
          </div>

          <Link to="/cart" onClick={onClose}>
            <button className="w-full bg-[#5B3B32] text-white py-3 rounded-xl font-semibold">
              View Cart
            </button>
          </Link>

          <Link to="/checkout" onClick={onClose}>
            <button className="w-full mt-3 bg-[#9A3F4D] text-white py-3 rounded-xl font-semibold">
              Checkout
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default MiniCartDrawer;