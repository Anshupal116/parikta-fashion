import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("parikta_cart")
        ) || []
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "parikta_cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const addToCart = (product) => {
    const productId = product._id || product.id;

    const selectedSize =
      product.selectedSize || "Free Size";

    const cartItemId = `${productId}-${selectedSize}`;

    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          id: productId,
          selectedSize,
          cartItemId,
          qty: 1,
        },
      ];
    });
  };

  const increaseQty = (cartItemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              qty: item.qty + 1,
            }
          : item
      )
    );
  };

  const decreaseQty = (cartItemId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => item.cartItemId !== cartItemId
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("parikta_cart");
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.qty,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.qty || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}