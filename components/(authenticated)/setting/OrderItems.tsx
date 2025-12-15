import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import ReviewRating from "@/components/(non-authenticated)/Review-Rating-modal/ReviewRating";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import { BadgeCheck, CreditCard } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
interface Order {
  orderId: string;
  orderDate: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  deliveryOption: string;
  deliveryCharge: string;
  discount: string;
  price: number;
  discountPercentage: number;
  discountPrice: number;
}

interface OrderItem {
  discountPercentage: number;
  discountPrice: number;
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmt: number;
  imageUrl: string;
}

interface OrderItemModalProps {
  order: Order | null;
  closeModal: () => void;
}

const OrderItem: React.FC<OrderItemModalProps> = ({ order, closeModal }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // State to store order items
  const [loading, setLoading] = useState<boolean>(true);

  // API call to update order status
  useEffect(() => {
    if (!order) {
      return;
    }
    const fetchOrderItems = async () => {
      try {
        const token = getTokenFromCookies();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order-item/?orderId=${order.orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              orderId: order.orderId,
            },
          }
        );
        setOrderItems(response.data);
        setLoading(false);
        console.log("Fetched order items:", response.data);
      } catch (error) {
        console.error("Error fetching order items:", error);
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [order?.orderId]);

  return (
    <div className="w-full">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {" "}
        <strong className="font-medium text-gray-800 dark:text-gray-200">
          Order Items:
        </strong>
      </p>
      <div className=" overflow-y-auto scrollbar-thin bg-gradient-to-r bg-white text-black sm:p-3 rounded-lg w-full max-w-3xl transform transition-all duration-300 ease-in-out ">
        {/* Order Items */}
        <div className="">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <LoadingContent key={index} className="w-full h-16 my-4" />
            ))
          ) : (
            // <p className="text-gray-500">Loading order items...</p>
            <div>
              <ul className=" pb-5 grid  xl:grid-cols-2  sm:gap-4">
                {orderItems.map(item => (
                  <li
                    key={item.orderItemId}
                    className="flex flex-col items-center justify-between p-4 bg-gray-100 rounded-lg shadow-lg transition-transform duration-300 ease-in-out "
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="relative w-40 h-20">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}${item.imageUrl}`}
                          alt={item.productName || "pic"}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                      {/* Product Details */}
                      <div className="text-gray-800">
                        <p className="font-semibold">{item.productName}</p>
                        <p>
                          Quantity: {item.quantity} × Rs.
                          {item.price -
                            (item.discountPercentage
                              ? item.price * item.discountPercentage
                              : 0) /
                              100}
                        </p>
                        <p className="text-red-600 sm:text-sm text-xs">
                          Discount Price: Rs.
                          {(item?.discountPercentage
                            ? (item?.price * item?.discountPercentage) / 100
                            : item.discountPrice) * item?.quantity}
                        </p>
                        <p className="text-primaryBlue font-semibold">
                          Total: Rs.
                          {item.totalAmt -
                            (item.quantity *
                              (item.discountPercentage
                                ? item.price * item.discountPercentage
                                : 0)) /
                              100}
                        </p>
                      </div>
                    </div>
                    {/* Rating Component */}
                    {order?.orderStatus !== "DELIVERED" ? null : (
                      <div className=" ">
                        <ReviewRating productId={item?.productId} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CreditCard className="text-blue-500 w-5 h-5" />
            <p className="text-gray-700 font-semibold">Payment Method:</p>
            <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {order?.paymentMethod}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BadgeCheck className="text-green-500 w-5 h-5" />
            <p className="text-gray-700 font-semibold">
              Status:
              <span
                className={`ml-2 inline-block px-3 py-1 rounded-full text-sm ${
                  order?.orderStatus === "Completed"
                    ? "bg-green-100 text-green-800"
                    : order?.orderStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order?.orderStatus}
              </span>
            </p>
          </div>
        </div>
        <div className="flex sm:gap-4 gap-2  sm:py-4 py-2">
          <div>
            <p className="">
              <strong className="text-gray-700 font-semibold">
                Delivery Charge :
              </strong>{" "}
              Rs.{order?.deliveryCharge}
            </p>
          </div>
          <div>
            <p className=" text-red-700 ">
              <strong className=" font-semibold text-red-700 dark:text-gray-200">
                Discount :
              </strong>{" "}
              Rs.
              {orderItems
                .reduce(
                  (sum, item) =>
                    sum +
                    (item?.discountPercentage
                      ? (item?.price * item?.discountPercentage) / 100
                      : item.discountPrice),
                  0
                )
                .toFixed(2)}
            </p>
          </div>
          <div className="xl:w-[200px] w-[50px] border-b-2 border-gray-300"></div>
          <div className="flex items-center justify-center  gap-1">
            <p className="text-primaryBlue font-semibold">Total: </p>{" "}
            <p> Rs.{Number(order?.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
