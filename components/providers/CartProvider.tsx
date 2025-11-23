// "use client";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
// } from "react";
// import { CartItem } from "../types/cartitems";
// import { toast } from "react-toastify";
// import {
//   getCookie,
//   getTokenFromCookies,
//   getUserFromCookies,
// } from "../cookie/cookie";
// import axios from "axios";
// import { useAuth } from "./AuthProvider";

// interface CartItemAPIResponse {
//   itemId: string;
//   cartId: string;
//   productId: string;
//   names: string;
//   quantities: number;
//   prices: number;
//   imageUrls: string[] | null;
// }

// const token = getCookie("token");
// interface CartContextProps {
//   cart: CartItem[];
//   addToCart: (product: CartItem, quantity?: number) => void;
//   increaseQuantity: (id: string, quantity?: number) => void;
//   decreaseQuantity: (id: string, quantity?: number) => void;
//   removeFromCart: (id: string) => void;
//   clearCart: () => void;
//   getTotalItems: () => number;
//   getTotalPrice: () => number;
// }
// export const fetchCartFromAPI = async (): Promise<CartItem[]> => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`,
//     {
//       headers: {
//         Authorization: `Bearer ${getTokenFromCookies()}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch cart from API");
//   }
//   const data = await response.json();

//   // Map API response to CartItem structure
//   const cart: CartItem[] = data.map((item: CartItemAPIResponse) => ({
//     id: item.itemId, // Assuming cartId is unique for each product
//     cartId: item.cartId,
//     productId: item.productId,
//     title: item.names,
//     quantity: item.quantities,
//     discountedPrice: item.prices,
//     imageUrls: item.imageUrls || null, // Handle potential null values
//   }));

//   return cart;
// };

// const CartContext = createContext<CartContextProps | undefined>(undefined);

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// };

// export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { isLoggedIn } = useAuth();

//   const user = getUserFromCookies();

//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [isClient, setIsClient] = useState(false);
//   useEffect(() => {
//     setIsClient(true); // Once the component mounts on the client, update the state
//   }, []);

//   useEffect(() => {
//     if (isClient) {
//       if (user) {
//         fetchCartFromAPI()
//           .then((data) => {
//             setCart(data);
//           })
//           .catch((err) => {
//             console.error("Failed to fetch cart from API:", err);
//           });
//       } else {
//         const savedCart = localStorage.getItem("cart");
//         if (savedCart) {
//           setCart(JSON.parse(savedCart));
//         }
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (isClient && !user) {
//       localStorage.setItem("cart", JSON.stringify(cart)); // Store cart in localStorage
//     }
//   }, [cart, user, isClient]);

//   const addToCart = useCallback(
//     async (product: CartItem, quantity: number = 1) => {
//       if (user) {
//         try {
//           const payload = {
//             products: { productId: product.id },
//             quantity,
//             price: product.discountedPrice,
//           };

//           const response = await fetch(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/add`,
//             {
//               method: "POST",
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify(payload),
//             }
//           );

//           if (!response.ok) {
//             throw new Error("Failed to add item to the cart on the server.");
//           }
//           fetchCartFromAPI()
//             .then((data) => {
//               setCart(data);
//             })
//             .catch((err) => {
//               console.error("Failed to fetch cart from API:", err);
//             });
//           toast.success(`${product.title} added to cart`);
//         } catch (error) {
//           console.error("Add to cart error:", error);
//           toast.error("Failed to add item to the cart. Please try again.");
//         }
//       } else {
//         // Fallback to local storage for non-logged-in users
//         setCart((prevCart) => {
//           const existingProductIndex = prevCart.findIndex(
//             (item) => item.id === product.id
//           );

//           if (existingProductIndex > -1) {
//             const updatedCart = [...prevCart];
//             updatedCart[existingProductIndex] = {
//               ...updatedCart[existingProductIndex],
//               quantity: updatedCart[existingProductIndex].quantity + quantity,
//             };
//             return updatedCart;
//           } else {
//             return [...prevCart, { ...product, quantity }];
//           }
//         });

//         toast.success(`${product.title} added to cart`);
//       }
//     },
//     [user]
//   );
//   const increaseQuantity = useCallback(
//     async (id: string, quantity: number = 1) => {
//       if (quantity <= 0) return;

//       if (user) {
//         try {
//           const response = await axios.post(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`,
//             {
//               itemId: id,
//               quantity: quantity,
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           if (response.status === 200) {
//             const updatedCart = await fetchCartFromAPI(); // Fetch the updated cart
//             setCart(updatedCart); // Update the cart state
//             toast.success("Quantity increased successfully.");
//           }
//         } catch (error) {
//           console.error("Increase quantity error:", error);
//           toast.error("Failed to increase quantity. Please try again.");
//         }
//       } else {
//         setCart((prevCart) =>
//           prevCart.map((item) =>
//             item.id === id ? { ...item, quantity: quantity } : item
//           )
//         );
//       }
//     },
//     [user]
//   );

//   const decreaseQuantity = useCallback(
//     async (id: string, quantity: number = 1) => {
//       if (quantity <= 0) return;

//       if (user) {
//         try {
//           const response = await axios.post(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/update`,
//             {
//               itemId: id,
//               quantity: quantity,
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           if (response.status === 200) {
//             const updatedCart = await fetchCartFromAPI(); // Fetch the updated cart
//             setCart(updatedCart); // Update the cart state
//             toast.success("Quantity decreased successfully.");
//           }
//         } catch (error) {
//           console.error("Decrease quantity error:", error);
//           toast.error("Failed to decrease quantity. Please try again.");
//         }
//       } else {
//         setCart((prevCart) =>
//           prevCart
//             .map((item) =>
//               item.id === id && item.quantity > quantity
//                 ? { ...item, quantity: quantity }
//                 : item
//             )
//             .filter((item) => item.quantity > 0)
//         );
//       }
//     },
//     [user]
//   );

//   const removeFromCart = useCallback(
//     async (id: string) => {
//       let removedItem = null;

//       if (user) {
//         try {
//           const response = await fetch(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/remove?cartItemId=${id}`,
//             {
//               method: "DELETE",
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           if (!response.ok) {
//             throw new Error(
//               "Failed to remove item from the cart on the server."
//             );
//           }

//           removedItem = cart.find((item) => item.id === id);
//           setCart((prevCart) => prevCart.filter((item) => item.id !== id));
//         } catch (error) {
//           console.error("Remove from cart error:", error);
//           toast.error("Failed to remove item from the cart. Please try again.");
//         }
//       } else {
//         // Fallback for non-logged-in users: Update local cart
//         removedItem = cart.find((item) => item.id === id);
//         setCart((prevCart) => prevCart.filter((item) => item.id !== id));
//       }

//       if (removedItem) {
//         toast.success(`${removedItem.title} removed from cart`);
//       }
//     },
//     [user, cart]
//   );

//   const clearCart = useCallback(async () => {
//     if (user) {
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/clear`,
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to clear the cart on the server.");
//         }

//         setCart([]); // Clear the local cart state
//         toast.success("Cart cleared successfully");
//       } catch (error) {
//         console.error("Failed to clear the cart:", error);
//         toast.error("Unable to clear the cart. Please try again.");
//       }
//     } else {
//       // For non-logged-in users, just clear the local cart
//       setCart([]);
//       toast.info("Cart cleared");
//     }
//   }, [user]);

//   const getTotalItems = useCallback(() => {
//     return cart.reduce((total, item) => total + item.quantity, 0);
//   }, [cart]);

//   const getTotalPrice = useCallback(() => {
//     return cart.reduce(
//       (total, item) => total + item.discountedPrice * item.quantity,
//       0
//     );
//   }, [cart]);

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         addToCart,
//         increaseQuantity,
//         decreaseQuantity,
//         removeFromCart,
//         clearCart,
//         getTotalItems,
//         getTotalPrice,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
