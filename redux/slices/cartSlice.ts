import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  productId: string;
  itemId?: string;
  name: string;
  description: string;
  flavor?: string | null;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  imageUrls: string[];
  cartId?: string | null;
  rating: number | null;
  wishlistId: string | null;
  stock?: number;
  quantities: number;
  discountPrice?: number;
  variableNo?: string;
  vendorId?: string;
  categoryName?: string;
}

export interface CartItem {
  discountPercentage: number;
  discountPrice: number;
  itemId?: string;
  cartId?: string;
  productId: string;
  names: string;
  quantities: number;
  prices: number;
  stock?: number;
  totalPrice: number;
  imageUrls: string[] | null;
  rating: number | null;
  variableNo?: string;
}
export interface CartProduct {
  discountPercentage: number;
  discountPrice: number;
  itemId?: string;
  cartId?: string;
  productId: string;
  names: string;
  quantities: number;
  prices: number;
  stock?: number;
  totalPrice: number;
  imageUrls: string | null;
  rating: number | null;
  variableNo?: string;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ✅ ADD / INCREASE ONLY (+1)
    addToCart(state, action: PayloadAction<Product>) {
      const newItem = action.payload;

      const existingItem = state.items.find(
        item =>
          item.productId === newItem.productId &&
          item.variableNo === newItem.variableNo
      );

      const unitPrice =
        newItem.price -
        (newItem.discountPercentage
          ? (newItem.price * newItem.discountPercentage) / 100
          : newItem.discountPrice || 0);

      if (existingItem) {
        existingItem.quantities += 1;
        existingItem.totalPrice = existingItem.quantities * unitPrice;
        if (newItem.itemId) existingItem.itemId = newItem.itemId;
      } else {
        state.items.push({
          discountPercentage: newItem.discountPercentage,
          discountPrice: newItem.discountPrice ?? 0,
          productId: newItem.productId,
          names: newItem.name,
          quantities: 1,
          prices: unitPrice,
          totalPrice: unitPrice,
          imageUrls: newItem.imageUrls?.length ? [newItem.imageUrls[0]] : [],
          itemId: newItem.itemId,
          rating: newItem.rating,
          stock: newItem.stock,
          variableNo: newItem.variableNo,
        });
      }
    },

    // ✅ DECREASE ONLY (-1)
    removeFromCart(state, action: PayloadAction<string>) {
      const productId = action.payload;

      const existingItem = state.items.find(
        item => item.productId === productId
      );

      if (!existingItem) return;

      if (existingItem.quantities === 1) {
        state.items = state.items.filter(
          item => item.productId !== productId
        );
      } else {
        existingItem.quantities -= 1;
        existingItem.totalPrice =
          existingItem.quantities * existingItem.prices;
      }
    },

    // ✅ SET EXACT QUANTITY (for backend sync)
    setQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const { productId, quantity } = action.payload;

      const existingItem = state.items.find(
        item => item.productId === productId
      );

      if (!existingItem) return;

      if (quantity <= 0) {
        state.items = state.items.filter(
          item => item.productId !== productId
        );
      } else {
        existingItem.quantities = quantity;
        existingItem.totalPrice = quantity * existingItem.prices;
      }
    },

    deleteFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        item => item.productId !== action.payload
      );
    },

    setCartData(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },

    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  setQuantity,
  deleteFromCart,
  setCartData,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
