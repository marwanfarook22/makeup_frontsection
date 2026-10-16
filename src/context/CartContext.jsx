import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "cart";

const CartContext = createContext(null);

function loadCart() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
      throw new Error("Saved cart data is not an array.");
    }

    return parsedCart.filter(
      (item) =>
        item?.product?._id &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product?._id || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error(
        "A valid product and positive integer quantity are required.",
      );
    }

    setCartItems((items) => {
      const existingItem = items.find(
        (item) => item.product._id === product._id,
      );

      if (existingItem) {
        return items.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity, product }
            : item,
        );
      }

      return [...items, { product, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Cart quantity must be a positive integer.");
    }

    setCartItems((items) =>
      items.map((item) =>
        item.product._id === productId
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((items) =>
      items.filter((item) => item.product._id !== productId),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [cartItems, cartCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
