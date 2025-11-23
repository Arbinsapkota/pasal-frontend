// Define the type for the order data
export interface Order {
  customerName: string | null;
  price: number;
  discountPercentage: number;
  discountPrice: number;
  orderId: string;
  orderDate: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  deliveryOption: string;
  deliveryCharge: string;
  discount: string;
}
