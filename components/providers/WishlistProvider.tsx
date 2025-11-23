"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getCookie } from "../cookie/cookie";
import { Product } from "../types/product";
import { Wishlist } from "../types/whishlist";
import { useAuth } from "./AuthProvider";
const token = getCookie("token");

export const fetchWishlistFromAPI = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch wishlist.");
    }

    const data = response.data;

    // Map the API response to the Product structure
    const wishlist: Product[] = data.map((item: Wishlist) => ({
      id: item.productId,
      title: item.name,
      description: item.description,
      price: item.price,
      discountedPrice: item.discountedPrice,
      imageUrls: item.imageUrls,
      rating: item.rating || null, // Handle potential null values
      wishlistId: item.wishlistId, // Include this if needed
    }));

    return wishlist;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw new Error("Unable to fetch wishlist. Please try again.");
  }
};

interface WishlistContextProps {
  wishlist: Product[]; // A Product interface or similar structure to cart items
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(
  undefined
);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn } = useAuth();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Once the component mounts on the client, update the state
  }, []);

  useEffect(() => {
    if (isClient) {
      if (isLoggedIn) {
        // Fetch the wishlist from the API for logged-in users
        fetchWishlistFromAPI().then((data) => setWishlist(data));
      } else {
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      }
    }
  }, [isClient, isLoggedIn]);

  useEffect(() => {
    if (isClient && !isLoggedIn) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist)); // Store wishlist in localStorage for non-logged-in users
    }
  }, [wishlist, isLoggedIn, isClient]);

  const addToWishlist = useCallback(
    async (product: Product) => {
      // console.log(product);
      // Check if product is already in the wishlist
      const isProductInWishlist = wishlist.some(
        (item) => item.id === product.id
      );

      if (isProductInWishlist) {
        toast.info(`${product.title} is already in your wishlist.`);
        return; // Don't add the product again if it's already in the wishlist
      }

      if (isLoggedIn) {
        try {
          // Call API to add product to the wishlist
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },

              body: JSON.stringify({ product: { productId: product.id } }),
            }
          );
          if (!response.ok) {
            throw new Error("Failed to add item to the wishlist.");
          }
          // Optionally, fetch the updated wishlist from the server
          fetchWishlistFromAPI().then((data) => setWishlist(data));
          toast.success(`${product.title} added to your wishlist`);
        } catch (error) {
          console.error("Add to wishlist error:", error);
          toast.error("Failed to add item to the wishlist. Please try again.");
        }
      } else {
        setWishlist((prevWishlist) => [...prevWishlist, product]);
        toast.success(`${product.title} added to your wishlist`);
      }
    },
    [isLoggedIn, wishlist] // Include wishlist in dependency array to track changes
  );

  const removeFromWishlist = useCallback(
    async (id: string) => {
      if (isLoggedIn) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/?wishlistId=${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to remove item from the wishlist.");
          }
          setWishlist((prevWishlist) =>
            prevWishlist.filter((item) => item.id !== id)
          );
          toast.success("Item removed from wishlist.");
        } catch (error) {
          console.error("Remove from wishlist error:", error);
          toast.error(
            "Failed to remove item from the wishlist. Please try again."
          );
        }
      } else {
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.id !== id)
        );
      }
    },
    [isLoggedIn]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
