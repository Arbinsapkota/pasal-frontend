import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";

const persistConfig = {
  key: "ETECH",
  storage,
};
// const persistConfig = {
//   key: "everestFitness",
//   storage,
// };

const wishlistPersistConfig = {
  key: "wishlist",
  storage,
};
const persistedReducer = persistReducer(persistConfig, cartReducer);
const persistedWishlistReducer = persistReducer(
  wishlistPersistConfig,
  wishlistReducer
);

const store = configureStore({
  reducer: {
    cart: persistedReducer,
    wishlist: persistedWishlistReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export { store, persistor };
