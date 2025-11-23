"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Define the Product interface
export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  imageUrls: string[];
  rating: number | null;
  subCategoryId: string;
}

// Define the shape of the context data
interface ProductContextType {
  products: Product[];
  fetchAndSetProducts: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Provider component
export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products function
  const fetchAndSetProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when the provider mounts
  useEffect(() => {
    fetchAndSetProducts();
  }, []);

  // Provide context value
  return (
    <ProductContext.Provider
      value={{ products, fetchAndSetProducts, loading, error }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Hook to use the ProductContext
export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
