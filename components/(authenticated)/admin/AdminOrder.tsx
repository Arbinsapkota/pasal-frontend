"use client";

import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import OrderDetailModal from "./AdminOrderDetailModal";

interface OrderContent {
  orderId: string;
  orderDate: string;
  discount: string;
  total: number;
  customerName: string;
  orderStatus:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  paymentMethod: string;
  deliveryOption: string;
  deliveryCharge: string;
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

interface Order {
  content: OrderContent[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElement: number;
  totalElements: number;
  totalPages: number;
}

interface SortingState {
  filterOption: "orderDate" | "total" | undefined;
  orderDirection: "ASC" | "DESC" | undefined;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | undefined;
  currentPage: number;
}

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const AdminOrders = ({
  setIsOrderUpdated,
}: {
  setIsOrderUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [orders, setOrders] = useState<Order | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<OrderContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState<boolean>(true);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [sortingState, setSortingState] = useState<SortingState>({
    filterOption: undefined,
    orderDirection: undefined,
    status: undefined,
    currentPage: 0,
  });

  // Fetch orders
  useEffect(() => {
    setIsLoading(true);
    let apiUrl = sortingState?.status ? "/api/order/filter" : "/api/order/";

    axiosAuthInstance()
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}${apiUrl}`, {
        params: {
          offset: sortingState?.currentPage,
          sortBy: sortingState?.filterOption,
          orderDirection: sortingState?.orderDirection,
          size: 10,
          status: sortingState?.status,
        },
      })
      .then(res => {
        setOrders(res.data);
        setLoading(false);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
        setIsLoading(false);
      });
  }, [isUpdated, sortingState]);

  const searchApi = useCallback(
    useDebouncedCallback(() => {
      axiosAuthInstance()
        .get("/api/order/search", {
          params: {
            searchValue: searchQuery,
            startDate: startDate ? formatDateToYYYYMMDD(startDate) : undefined,
            endDate: endDate ? formatDateToYYYYMMDD(endDate) : undefined,
          },
        })
        .then(res => {
          setOrders(res.data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching orders", err);
          setIsLoading(false);
        });
    }, 200),
    []
  );

  useEffect(() => {
    if (startDate && endDate) {
      setIsLoading(true);
      searchApi();
    }
  }, [searchQuery, startDate, endDate]);

  useEffect(() => {
    if (sortOption === "order-latest") {
      setSortingState(prev => ({ ...prev, filterOption: undefined, orderDirection: undefined, currentPage: 0 }));
    } else if (sortOption === "order-oldest") {
      setSortingState(prev => ({ ...prev, filterOption: "orderDate", orderDirection: "ASC", currentPage: 0 }));
    } else if (sortOption === "total-asc") {
      setSortingState(prev => ({ ...prev, filterOption: "total", orderDirection: "ASC", currentPage: 0 }));
    } else if (sortOption === "total-desc") {
      setSortingState(prev => ({ ...prev, filterOption: "total", orderDirection: "DESC", currentPage: 0 }));
    }
  }, [sortOption]);

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders Management</h1>

      {/* Search & Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Order ID or Customer..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full md:w-64 transition"
        />
        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        >
          <option value="">Sort by</option>
          <option value="order-latest">Order Date (Latest)</option>
          <option value="order-oldest">Order Date (Oldest)</option>
          <option value="total-asc">Total Amount (Lowest)</option>
          <option value="total-desc">Total Amount (Highest)</option>
        </select>
      </div>

      {/* Date Pickers */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Start Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {startDate ? format(startDate, "PPP") : "Pick a date"}
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={value => value && setStartDate(value)}
                disabled={date => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">End Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {endDate ? format(endDate, "PPP") : "Pick a date"}
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={value => value && setEndDate(value)}
                disabled={date => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(status => (
          <button
            key={status}
            onClick={() =>
              setSortingState(prev => ({
                ...prev,
                status: status === "All" ? undefined : status as any,
              }))
            }
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition",
              sortingState?.status === status || (status === "All" && !sortingState?.status)
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            {status === "All" ? "All Orders" : status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["No.", "Order ID", "Customer", "Date", "Delivery Charge", "Total Amount", "Order Status", "Actions"].map(head => (
                <th key={head} className="px-4 py-3 text-left text-gray-600 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={8} className="px-4 py-3">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : orders?.content?.map((order, index) => (
                  <tr
                    key={order.orderId}
                    className="transition duration-300 ease-in-out hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 hover:bg-gradient-to-r"
                  >
                    <td className="px-4 py-3 text-gray-700">{sortingState.currentPage * 10 + (index + 1)}</td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-xs">{order.orderId}</td>
                    <td className="px-4 py-3 text-gray-700 truncate">{order.customerName}</td>
                    <td className="px-4 py-3 text-gray-700">{order.orderDate.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-700 text-center">Rs.{Number(order.deliveryCharge).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-700 text-center">Rs.{Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          order.orderStatus === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                          order.orderStatus === "SHIPPED" ? "bg-indigo-100 text-indigo-800" :
                          order.orderStatus === "DELIVERED" ? "bg-green-100 text-green-800" :
                          order.orderStatus === "CANCELLED" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        )}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Dialog
                        open={order.orderId === activeOrderId}
                        onOpenChange={isOpen =>
                          setActiveOrderId(isOpen ? order.orderId : null)
                        }
                      >
                        <DialogTrigger className={cn(buttonVariants({ variant: "default" }), "px-3 py-1")}>
                          View
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-[90%] sm:max-w-[60%] overflow-y-auto scrollbar-thin">
                          <DialogHeader>
                            <VisuallyHidden>
                              <DialogTitle>Order Details</DialogTitle>
                            </VisuallyHidden>
                          </DialogHeader>
                          <OrderDetailModal
                            order={order}
                            setIsOrderUpdated={setIsOrderUpdated}
                            closeModal={closeModal}
                            setIsUpdated={setIsUpdated}
                          />
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setSortingState(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 0) }))
            }
            disabled={loading || sortingState.currentPage === 0}
          >
            <FaChevronLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setSortingState(prev => (!orders?.last ? { ...prev, currentPage: prev.currentPage + 1 } : prev))
            }
            disabled={loading || orders?.last}
          >
            <FaChevronRight />
          </Button>
        </div>
        <div className="text-gray-600 font-medium">Total Orders: {orders?.totalElements}</div>
      </div>
    </div>
  );
};

export default AdminOrders;
