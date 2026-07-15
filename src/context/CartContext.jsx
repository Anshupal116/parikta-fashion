import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("parikta_cart")) || [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("parikta_applied_coupon")
      );
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("parikta_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(
        "parikta_applied_coupon",
        JSON.stringify(appliedCoupon)
      );
    } else {
      localStorage.removeItem("parikta_applied_coupon");
    }
  }, [appliedCoupon]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) * Number(item.qty || 1),
        0
      ),
    [cartItems]
  );

  useEffect(() => {
    if (
      appliedCoupon &&
      Number(appliedCoupon.originalAmount) !== Number(cartTotal)
    ) {
      setAppliedCoupon(null);
    }
  }, [cartTotal, appliedCoupon]);

  const discountAmount = Number(
    appliedCoupon?.discountAmount || 0
  );

  const finalTotal = Math.max(cartTotal - discountAmount, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product) => {
    const productId = product._id || product.id;
    const selectedSize = product.selectedSize || "Free Size";
    const cartItemId = `${productId}-${selectedSize}`;

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, qty: Number(item.qty || 1) + 1 }
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

    setIsCartOpen(true);
  };

  const increaseQty = (cartItemId) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, qty: Number(item.qty || 1) + 1 }
          : item
      )
    );
  };

  const decreaseQty = (cartItemId) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, qty: Number(item.qty || 1) - 1 }
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
    setAppliedCoupon(null);
    localStorage.removeItem("parikta_cart");
    localStorage.removeItem("parikta_applied_coupon");
  };

  const applyCouponToCart = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        discountAmount,
        finalTotal,
        appliedCoupon,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        applyCouponToCart,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}