export interface Product {
  id: string;
  title: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  imageUrls: string[] | string;
  rating: number | null;
  productId: string | null;
  quantity: number;
}
