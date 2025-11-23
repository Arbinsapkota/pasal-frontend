export interface Wishlist {
  discountPercentage: number;
  id: string;
  title: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  imageUrls: string[];
  rating: number | null;
  productId: string;
  quantity: number;
  wishlistId?: string | null;
  stock?: number;
}
