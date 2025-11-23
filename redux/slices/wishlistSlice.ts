import { Wishlist } from "@/components/types/whishlist";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "./cartSlice";

interface WishlistState {
  items: Wishlist[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<Product>) {
      const newProduct = action.payload;

      // Convert the Product to Wishlist format
      const newItem: Wishlist = {
        discountPercentage: newProduct.discountPercentage || 0,
        id: newProduct.productId, // You can choose to generate this as needed
        title: newProduct.name, // Assuming the title is the name of the product
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        discountedPrice: newProduct.discountedPrice,
        imageUrls: newProduct.imageUrls,
        rating: newProduct.rating,
        productId: newProduct.productId, // Linking the productId to the wishlist item
        quantity: 1, // You can set the default quantity to 1 or whatever suits your needs
        wishlistId: newProduct.wishlistId || "", // Optionally, use wishlistId if it's provided
      };

      const existingItem = state.items.find(
        item => item.productId === newItem.productId
      );

      if (!existingItem) {
        state.items.push(newItem);
      }
    },

    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        item => item.productId !== action.payload
      );
    },

    setWishlistData(state, action: PayloadAction<Wishlist[]>) {
      state.items = action.payload; // Replace items with the provided wishlist data
    },

    clearWishlist(state) {
      state.items = []; // Clear all items in the wishlist
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  setWishlistData,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
