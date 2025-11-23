// import { Product } from "@/utils/products";
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
  superCategory?: string;
  superCategoryName?: string;
  category?: string;
  categoryName?: string;
  stock?: number;
  quantities: number;
  subcategory?: string;
  subcategoryName?: string;
  labelImgUrl?: string;
  discountPrice?: number;
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
  wishlistId?: string;
  rating: number | null; // Add the rating property

  // discountedPrice?: number | undefined;
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
    addToCart(state, action: PayloadAction<Product>) {
      const newItem = action.payload;

      const existingItem = state.items.find(
        item => item.productId === newItem.productId
      );

      const itemPrice = newItem.price;

      if (existingItem) {
        existingItem.quantities++;
        existingItem.totalPrice += itemPrice;
        if (newItem.itemId) existingItem.itemId = newItem.itemId;
      } else {
        state.items.push({
          discountPercentage: newItem.discountPercentage,
          discountPrice: newItem?.discountPrice ?? 0,
          productId: newItem.productId,
          names: newItem.name,
          quantities: 1,
          prices:
            itemPrice -
            (newItem.discountPercentage
              ? (newItem.price * newItem.discountPercentage) / 100
              : newItem.discountPrice || 0),
          totalPrice: itemPrice,
          imageUrls: newItem.imageUrls?.length ? [newItem.imageUrls[0]] : [],
          itemId: newItem.itemId,
          rating: newItem.rating,
          stock: newItem?.stock,
        });
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      const productId = action.payload;

      const existingItem = state.items.find(
        item => item.productId === productId
      );

      if (existingItem) {
        if (existingItem.quantities === 1) {
          state.items = state.items.filter(
            item => item.productId !== productId
          );
        } else {
          existingItem.quantities--;
          existingItem.totalPrice -= existingItem.prices;
        }
      }
    },

    deleteFromCart(state, action: PayloadAction<string>) {
      const productId = action.payload;

      const existingItem = state.items.find(
        item => item.productId === productId
      );

      if (existingItem) {
        state.items = state.items.filter(item => item.productId !== productId);
      }
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
  setCartData,
  deleteFromCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
