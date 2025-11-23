import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "@/components/cookie/cookie";
import { Order } from "@/components/types/order";
import OrderItem from "./OrderItems";

const MyReviews: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Selected order state

  // Open the modal with selected order
  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedOrder(null);
    setOpen(false);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Order[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/by-user`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );

      const fetchedOrders = response.data.map((order) => ({
        ...order,
        orderDate: new Date(order.orderDate).toLocaleDateString(), // Format the date
      }));

      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">My Orders To Review</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Order ID
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Date
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Payment
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Delivery
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border-t">
                <td className="py-3 px-4 text-gray-700">{order.orderId}</td>
                <td className="py-3 px-4 text-gray-700">{order.orderDate}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.orderStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.orderStatus === "PROCESSING"
                        ? "bg-blue-100 text-blue-800"
                        : order.orderStatus === "SHIPPED"
                        ? "bg-indigo-100 text-indigo-800"
                        : order.orderStatus === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : order.orderStatus === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : order.orderStatus === "RETURNED"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800" // For COMPLETED
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {order.paymentMethod}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {order.deliveryOption}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  ${order.total.toFixed(2)}
                </td>
                <td
                  className="py-3 px-4 text-gray-700"
                  onClick={() => openModal(order)}
                >
                  View Items
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Order Detail Modal */}
      {open && <OrderItem order={selectedOrder} closeModal={closeModal} />}
    </div>
  );
};

export default MyReviews;
