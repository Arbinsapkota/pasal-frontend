"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CartItem } from "../types/cartitems";

type CheckoutContextType = {
  getTotalPrice: () => number;
  checkoutItems: CartItem[];
  addItemToCheckout: (item: CartItem) => void;
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

interface CheckoutProviderProps {
  children: ReactNode; // Explicitly typing children
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
}) => {
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  const addItemToCheckout = (item: CartItem) => {
    // console.log("from checkoutprovider", item);
    setCheckoutItems((prevItems) => [...prevItems, item]);
  };

  const getTotalPrice = useCallback(() => {
    return checkoutItems.reduce(
      (total, item) => total + item.discountedPrice * item.quantity,
      0
    );
  }, [checkoutItems]);

  return (
    <CheckoutContext.Provider
      value={{ checkoutItems, addItemToCheckout, getTotalPrice }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
