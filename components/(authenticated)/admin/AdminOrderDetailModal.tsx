import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import Image from "next/image";
import React, { SetStateAction, useEffect, useState } from "react";
import {
  FaBan,
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaCreditCard,
  FaDollarSign,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShippingFast,
  FaTruck,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface Order {
  orderId: string;
  orderDate: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  deliveryOption: string;
  deliveryCharge: string;
  customerName: string;
  discount: string;
  shippingInfo: {
    shippingId: string;
    users: null;
    address: string;
    phoneNumber: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType: string;
    createdAt: string | null;
    updatedAt: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

interface OrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmt: number;
  imageUrl: string;
}

interface OrderDetailModalProps {
  order: Order;
  setIsOrderUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  closeModal: () => void;
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  setIsOrderUpdated,
  order,
  closeModal,
  setIsUpdated,
}) => {
  const [status, setStatus] = useState<string>(order.orderStatus);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // State to store order items
  const [loading, setLoading] = useState<boolean>(true);

  // API call to update order status
  const updateOrderStatus = async (newStatus: string) => {
    const token = getTokenFromCookies(); // Dynamically fetch the token
    axiosAuthInstance()
      .post(`/api/order/status?`, null, {
        params: {
          orderId: order.orderId,
          orderStatus: newStatus,
        },
      })
      .then((res) => {
        setStatus(newStatus); // Update the local state with the new status
        toast.success(`Order status updated to ${newStatus}`);
        setIsUpdated((prev) => !prev);
        setIsOrderUpdated((prev) => !prev);
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
          toast.dismiss();
        toast.error("Error updating status");
      });
  };

  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching order items:", error);
          toast.dismiss();
        toast.error("Error fetching order items");
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [order.orderId]);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long", // Full name of the day
      year: "numeric",
      month: "long", // Full month name
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // 12-hour clock format
    });
  }

  return (
    // <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 max-w-4xl mx-auto">
      {/* Header with animated gradient border */}
      <div className="relative mb-8 pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-gradient-to-r after:from-yellow-300 after:via-orange-400 after:to-yellow-300 after:rounded-full after:animate-pulse">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white flex items-center justify-center gap-3">
          <FaCar className="text-yellow-400 text-2xl" />
          Order Details
        </h2>
      </div>

      {/* Main content in a two-column layout on larger screens */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column - Customer & Order Info */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <FaIdCard className="text-blue-500" />
              Customer Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <span className="w-1/3 text-gray-500 dark:text-gray-400 font-medium">
                  Name:
                </span>
                <span className="w-2/3 font-semibold text-gray-800 dark:text-gray-200">
                  {order?.customerName}
                </span>
              </div>

              <div className="flex items-start">
                <span className="w-1/3 text-gray-500 dark:text-gray-400 font-medium">
                  Order ID:
                </span>
                <span className="w-2/3 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                  {order.orderId}
                </span>
              </div>

              <div className="flex items-start">
                <span className="w-1/3 text-gray-500 dark:text-gray-400 font-medium">
                  Date:
                </span>
                <span className="w-2/3 flex items-center gap-1">
                  <FaCalendarAlt className="text-green-500 text-sm" />
                  {formatDate(order.orderDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <FaCreditCard className="text-purple-500" />
              Payment Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Charge
                </span>
                <span className="font-medium flex items-center">
                  Rs.
                  {order.deliveryCharge}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount
                </span>
                <span className="font-medium flex items-center text-green-600">
                  Rs.
                  {order.discount}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                  Total Amount
                </span>
                <span className="text-lg font-bold flex items-center text-gray-900 dark:text-white">
              Rs.
                  {Number(order?.total) }
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Payment Method:
                  </span>
                  <span className="font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery Option:
                  </span>
                  <span className="font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                    {order.deliveryOption}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Shipping & Status */}
        <div className="space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" />
              Shipping Information
            </h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="min-w-5 pt-1">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">{order?.shippingInfo?.address}</p>
                  <p>
                    {order?.shippingInfo?.city}, {order?.shippingInfo?.state}
                  </p>
                  <p>
                    {order?.shippingInfo?.country},{" "}
                    {order?.shippingInfo?.postalCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <FaPhoneAlt className="text-gray-400" />
                <span>{order?.shippingInfo?.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <FaShippingFast className="text-orange-500" />
              Order Status
            </h3>

            <div className="relative">
              <select
                id="status"
                value={status}
                onChange={(e) => updateOrderStatus(e.target.value)}
                className="w-full p-3 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 appearance-none cursor-pointer shadow-sm"
              >
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <FaTruck
                  className={`text-lg ${
                    status === "PROCESSING"
                      ? "text-yellow-500"
                      : status === "SHIPPED"
                      ? "text-blue-500"
                      : status === "DELIVERED"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mt-6 relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

              <div
                className={`relative pl-10 pb-5 ${
                  status === "PROCESSING" ||
                  status === "SHIPPED" ||
                  status === "DELIVERED"
                    ? "opacity-100"
                    : "opacity-50"
                }`}
              >
                <div
                  className={`absolute left-0 w-6 h-6 rounded-full border-2 ${
                    status === "PROCESSING" ||
                    status === "SHIPPED" ||
                    status === "DELIVERED"
                      ? "bg-yellow-500 border-yellow-600"
                      : "bg-gray-300 border-gray-400"
                  } flex items-center justify-center`}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h4 className="font-medium">Processing</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order has been received
                </p>
              </div>

              <div
                className={`relative pl-10 pb-5 ${
                  status === "SHIPPED" || status === "DELIVERED"
                    ? "opacity-100"
                    : "opacity-50"
                }`}
              >
                <div
                  className={`absolute left-0 w-6 h-6 rounded-full border-2 ${
                    status === "SHIPPED" || status === "DELIVERED"
                      ? "bg-blue-500 border-blue-600"
                      : "bg-gray-300 border-gray-400"
                  } flex items-center justify-center`}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h4 className="font-medium">Shipped</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your order is on the way
                </p>
              </div>

              <div
                className={`relative pl-10 ${
                  status === "DELIVERED" ? "opacity-100" : "opacity-50"
                }`}
              >
                <div
                  className={`absolute left-0 w-6 h-6 rounded-full border-2 ${
                    status === "DELIVERED"
                      ? "bg-green-500 border-green-600"
                      : "bg-gray-300 border-gray-400"
                  } flex items-center justify-center`}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h4 className="font-medium">Delivered</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order has been delivered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1.5 rounded">
            <FaTruck className="text-lg" />
          </span>
          Order Items
        </h3>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            {orderItems.map((item) => (
              <li
                key={item.orderItemId}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
              >
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <Image
                    src={
                      item?.imageUrl && item?.imageUrl.startsWith("http")
                        ? item?.imageUrl
                        : "/product.png"
                    }
                    alt={item.productName || "Product image"}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {item.productName}
                  </h4>

                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        Qty:{" "}
                        <span className="font-medium">{item.quantity}</span> ×{" "}
                        <span className="font-medium">Rs.{item.price}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white flex items-center">
                      Rs.
                        {item.totalAmt}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    // </div>
  );
};

export default OrderDetailModal;
