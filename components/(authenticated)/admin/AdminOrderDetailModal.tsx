import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { SetStateAction, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCar,
  FaCreditCard,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShippingFast,
  FaTruck,
} from "react-icons/fa";

import { toast } from "react-toastify";

const statusSteps = [
  {
    key: "PROCESSING",
    label: "Processing",
    description: "Order has been confirmed",
    color: "yellow",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Order is on the way",
    color: "blue",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Order successfully delivered",
    color: "green",
  },
];

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
  promoCodeDiscount?: number;
  promoCode?: string;
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
  discountedPrice?: number;
  discountPercentage?: number;
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
          <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700 p-6 hover:shadow-2xl transition-all">
  <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-700 dark:text-blue-300">
    <FaIdCard className="text-2xl" /> Customer Information
  </h3>
  <div className="space-y-3 text-gray-700 dark:text-gray-300">
    <div className="flex items-start justify-between">
      <span className="font-medium">Name:</span>
      <span className="font-semibold text-gray-900 dark:text-white">{order.customerName}</span>
    </div>
    <div className="flex items-start justify-between">
      <span className="font-medium">Order ID:</span>
      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
        {order.orderId}
      </span>
    </div>
    <div className="flex items-start justify-between">
      <span className="font-medium">Date:</span>
      <span className="flex items-center gap-1">
        <FaCalendarAlt className="text-green-500 text-sm" />
        {formatDate(order.orderDate)}
      </span>
    </div>
  </div>
</div>

        
          {/* Payment Info Card - Modern Premium Version */}
          {/* Payment Info Card */}

<div className="bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700 p-6 hover:shadow-2xl transition-all">
  <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-purple-700 dark:text-purple-300">
    <FaCreditCard className="text-2xl" /> Payment Details
  </h3>

  {orderItems.length > 0 && (() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const productDiscount = orderItems.reduce(
      (sum, item) => sum + item.quantity * (item.price * ((item.discountPercentage || 0) / 100)),
      0
    );
    const promoCodeDiscount = order.promoCodeDiscount || 0;
    const deliveryCharge = Number(order.deliveryCharge || 0);
    const totalAmount = subtotal - productDiscount - promoCodeDiscount + deliveryCharge;

    return (
      <div className="space-y-3 text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
        </div>
        {productDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Product Discount</span>
            <span>- Rs. {productDiscount.toFixed(2)}</span>
          </div>
        )}
        {promoCodeDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Promo Code ({order.promoCode})</span>
            <span>- Rs. {promoCodeDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span className="font-semibold">Rs. {deliveryCharge.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-lg">
          <span>Total Amount</span>
          <span>Rs. {totalAmount.toFixed(2)}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span>Payment Method:</span>
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {order.paymentMethod}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span>Delivery Option:</span>
            <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
              {order.deliveryOption}
            </span>
          </div>
        </div>
      </div>
    );
  })()}
</div>

        </div>

        {/* Right column - Shipping & Status */}
        <div className="space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20 rounded-xl shadow-lg border border-red-200 dark:border-red-700 p-6 hover:shadow-2xl transition-all">
  <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-red-700 dark:text-red-300">
    <FaMapMarkerAlt className="text-2xl" /> Shipping Information
  </h3>
  <div className="space-y-3 text-gray-700 dark:text-gray-300">
    <div className="flex items-start gap-3">
      <FaMapMarkerAlt className="mt-1 text-gray-400 dark:text-gray-500" />
      <div>
        <p className="font-medium">{order.shippingInfo.address}</p>
        <p>{order.shippingInfo.city}, {order.shippingInfo.state}</p>
        <p>{order.shippingInfo.country}, {order.shippingInfo.postalCode}</p>
      </div>
    </div>
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <FaPhoneAlt className="text-gray-400" />
      <span className="font-medium">{order.shippingInfo.phoneNumber}</span>
    </div>
  </div>
</div>

          {/* Order Status Card */}
         {/* PREMIUM ORDER STATUS CARD */}
<div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
      <span className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
        <FaShippingFast className="text-orange-500 text-xl" />
      </span>
      Order Status
    </h3>

    {/* Status Badge */}
    <span
      className={`px-4 py-1 rounded-full text-sm font-semibold ${
        status === "PROCESSING"
          ? "bg-yellow-100 text-yellow-700"
          : status === "SHIPPED"
          ? "bg-blue-100 text-blue-700"
          : status === "DELIVERED"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  </div>

  {/* Dropdown */}
  <div className="relative mb-8">
    <select
      value={status}
      onChange={(e) => updateOrderStatus(e.target.value)}
      className="w-full p-3 pr-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-400 appearance-none shadow-sm cursor-pointer"
    >
      <option value="PROCESSING">Processing</option>
      <option value="SHIPPED">Shipped</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>

    <FaTruck
      className={`absolute right-4 top-1/2 -translate-y-1/2 text-xl ${
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

  {/* Timeline */}
  <div className="relative pl-8">
    {/* Vertical Line */}
    <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-400 to-orange-200 dark:from-orange-600 dark:to-orange-900 rounded-full" />

    {statusSteps.map((step, index) => {
      const isActive =
        statusSteps.findIndex((s) => s.key === status) >= index;

      return (
        <motion.div
          key={step.key}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 }}
          className="relative mb-8 flex gap-4 items-start"
        >
          {/* Animated Dot */}
          <motion.div
            animate={
              isActive
                ? {
                    scale: [1, 1.25, 1],
                    boxShadow: [
                      "0 0 0 rgba(0,0,0,0)",
                      "0 0 20px rgba(255,165,0,0.6)",
                      "0 0 0 rgba(0,0,0,0)",
                    ],
                  }
                : {}
            }
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
              isActive
                ? `bg-${step.color}-500 border-${step.color}-600`
                : "bg-gray-300 border-gray-400"
            }`}
          >
            <span className="w-2 h-2 bg-white rounded-full" />
          </motion.div>

          {/* Text */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {step.label}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step.description}
            </p>
          </div>
        </motion.div>
      );
    })}
  </div>
</div>


        </div>
      </div>

      {/* Order Items Section */}
     <div className="mt-8">
  {/* Cart Summary */}
  <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-sm flex justify-between items-center">
    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Order Summary</h3>
    {orderItems.length > 0 && (
      <div className="text-right">
        {(() => {
          const totalOriginal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalDiscounted = orderItems.reduce(
            (sum, item) =>
              sum + item.quantity * (item.price - (item.price * (item.discountPercentage || 0)) / 100),
            0
          );
          const totalSavings = totalOriginal - totalDiscounted;
          return (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Total: Rs. {totalDiscounted.toFixed(2)}
              </p>
              {totalSavings > 0 && (
                <p className="text-green-600 text-sm font-medium">
                  You saved Rs. {totalSavings.toFixed(2)} in total! 🎉
                </p>
              )}
            </>
          );
        })()}
      </div>
    )}
  </div>

  {/* Cart Items */}
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
      {orderItems.map((item) => {
        const discountedPrice =
          item.price - (item.price * (item.discountPercentage || 0)) / 100;
        const totalDiscountedAmt = discountedPrice * item.quantity;
        const totalSavings = (item.price - discountedPrice) * item.quantity;

        return (
          <li
            key={item.orderItemId}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <Image
                src={
                  item?.imageUrl && item?.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : "/product.png"
                }
                alt={item.productName || "Product image"}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
              {(item.discountPercentage || 0) > 0 && (
                <span className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                  -{item.discountPercentage}%
                </span>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                {item.productName}
              </h4>

              <div className="flex justify-between items-end mb-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Qty: <span className="font-medium">{item.quantity}</span> ×{" "}
                    <span className="font-medium">
                      {(item.discountPercentage || 0) > 0 && (
                        <span className="line-through text-gray-400 dark:text-gray-500 mr-1">
                          Rs.{item.price.toFixed(2)}
                        </span>
                      )}
                      <span className="text-orange-500 font-semibold">
                        Rs.{discountedPrice.toFixed(2)}
                      </span>
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-orange-500 font-bold text-lg flex items-center">
                    Rs. {totalDiscountedAmt.toFixed(2)}
                  </p>
                </div>
              </div>

              {totalSavings > 0 && (
                <p className="text-green-600 text-sm font-medium">
                  You saved Rs. {totalSavings.toFixed(2)} 🎉
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  )}
</div>
</div>
    // </div>
  );
};

export default OrderDetailModal;
