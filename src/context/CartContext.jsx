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
        JSON.parse(localStorage.getItem("parikta_cart")) ||
        []
      );
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "parikta_cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const addToCart = (product) => {
    const productId = product._id || product.id;
    const selectedSize =
      product.selectedSize || "Free Size";

    const cartItemId = `${productId}-${selectedSize}`;

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          ...product,
          id: productId,
          selectedSize,
          cartItemId,
          qty: 1,
        },
      ];
    });

    // Product add hote hi drawer open
    setIsCartOpen(true);
  };

  const increaseQty = (cartItemId) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
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
    setCartItems((previousItems) =>
      previousItems
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
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.cartItemId !== cartItemId
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("parikta_cart");
  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.qty || 0),
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
        cartCount,
        cartTotal,

        isCartOpen,
        openCart,
        closeCart,

        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}