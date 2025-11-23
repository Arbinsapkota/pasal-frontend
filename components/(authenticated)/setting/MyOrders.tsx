"use client";

import { getTokenFromCookies } from "@/components/cookie/cookie";
import MyOrderListLoading from "@/components/loaidng/MyOrderListLoading";
import type { Order } from "@/components/types/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";
import OrderItem from "./OrderItems";

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const closeModal = () => {
    setOpenOrderId(null);
  };

  const fetchOrders = async () => {
    const token = getTokenFromCookies();
    try {
      setLoading(true);
      const response = await axios.get<Order[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/by-user`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedOrders = response.data
        .slice() // clone the array to avoid mutating original
        .sort((a, b) => {
          const dateA = new Date(a.orderDate).getTime();
          const dateB = new Date(b.orderDate).getTime();
          return dateB - dateA; // latest first
        })
        .map(order => ({
          ...order,
          orderDate: new Date(order.orderDate).toLocaleDateString(), // format after sorting
        }));

      setOrders(fetchedOrders);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      // setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
        My Orders
      </h1>

      {loading ? (
        [...Array(4)].map((_, index) => <MyOrderListLoading key={index} />)
      ) : orders.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          You don&apos;t have any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.orderId}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-base font-semibold">
                    {order.paymentMethod}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "text-sm font-semibold px-3 py-1 rounded-full",
                      order.orderStatus === "Delivered"
                        ? "text-green-600 bg-green-100"
                        : order.orderStatus === "Pending"
                        ? "text-yellow-600 bg-yellow-100"
                        : "text-blue-600 bg-blue-100"
                    )}
                  >
                    {order.orderStatus}
                  </div>
                  <p className="text-sm text-gray-400">{order.orderDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Delivery Charge</p>
                  <p className="font-medium">Rs. {order.deliveryCharge}</p>
                </div>
                {/* <div>
                  <p className="text-gray-500">Discount</p>
                  <p className="font-medium">Rs. {order.discount}</p>
                </div> */}
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-medium">
                    Rs. {order.total + order.deliveryCharge}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium">#{order.orderId}</p>
                </div>
              </div>

              <div className="flex justify-start gap-2 items-center">
                <Dialog
                  open={openOrderId === order.orderId}
                  onOpenChange={isOpen =>
                    isOpen
                      ? setOpenOrderId(order.orderId)
                      : setOpenOrderId(null)
                  }
                >
                  <DialogTrigger asChild>
                    <button className="text-sm text-white bg-red-500 hover:bg-red-600 rounded-full px-4 py-1.5 transition">
                      View Details
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin max-w-[90%] sm:max-w-[70%] md:max-w-[60%]">
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    <OrderItem order={order} closeModal={closeModal} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
