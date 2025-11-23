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
import OrderDetailModal from "./AdminOrderDetailModal"; // Import the new modal component

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
  const [orders, setOrders] = useState<Order | undefined>(); // Orders state
  const [selectedOrder, setSelectedOrder] = useState<OrderContent | null>(null); // Selected order state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state
  const [sortOption, setSortOption] = useState<string>(""); // Sort option state

  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [isUpdated, setIsUpdated] = useState<boolean>(true);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const newDate = new Date();
  const lastMonth = new Date(newDate);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [sortingState, setSortingState] = useState<SortingState>({
    filterOption: undefined,
    orderDirection: undefined,
    status: undefined,
    currentPage: 0,
  });

  // Fetch orders from API
  useEffect(() => {
    setIsLoading(true);
    let apiUrl;
    if (sortingState?.status) {
      apiUrl = "/api/order/filter";
    } else {
      apiUrl = "/api/order/";
    }

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
        setOrders(res.data); // Update orders state
        // console.log("this are the orders", res.data);
        setLoading(false); // Set loading to false
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false); // Set loading to false
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
          console.log("Search results:", res.data);
        })
        .catch(err => {
          console.error("Error fetching orders", err);
          setIsLoading(false);
        });

      // if (searchQuery.length == 0) {
      //   setIsLoading(true);
      //   setIsUpdated((prev) => !prev);
      // }
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
    if (sortOption == "order-latest") {
      setSortingState(prev => {
        return {
          ...prev,
          filterOption: undefined,
          orderDirection: undefined,
          currentPage: 0,
        };
      });
    } else if (sortOption == "order-oldest") {
      setSortingState(prev => {
        return {
          ...prev,
          filterOption: "orderDate",
          orderDirection: "ASC",
          currentPage: 0,
        };
      });
    } else if (sortOption == "total-asc") {
      setSortingState(prev => {
        return {
          ...prev,
          filterOption: "total",
          orderDirection: "ASC",
          currentPage: 0,
        };
      });
    } else if (sortOption == "total-desc") {
      setSortingState(prev => {
        return {
          ...prev,
          filterOption: "total",
          orderDirection: "DESC",
          currentPage: 0,
        };
      });
    }
  }, [sortOption]);

  // Close the modal
  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Orders Management</h1>

      <div className="flex items-center flex-wrap gap-2">
        {/* Search and Sort Controls */}
        <div className="flex items-center  space-x-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
          {/* <input
          type="text"
          placeholder="Search by Customer Name..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        /> */}
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">Sort by</option>
            <option value="order-latest">Order Date (Latest)</option>
            <option value="order-oldest">Order Date (Oldest)</option>
            {/* <option value="customerName-desc">Customer Name (Z-A)</option> */}
            {/* <option value="orderId-asc">Order ID (A-Z)</option> */}
            {/* <option value="orderId-desc">Order ID (Z-A)</option> */}
            <option value="total-asc">Total Amount (Lowest)</option>
            <option value="total-desc">Total Amount (Highest)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-10 pt-4">
        <div className="flex gap-2  items-center">
          <p className="text-sm font-medium truncate">Start Date :</p>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full md:w-[240px] pl-3 text-left font-normal"
                )}
              >
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span className="">Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={value => {
                  if (value) setStartDate(value);
                }}
                disabled={date =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 items-center">
          <p className="text-sm font-medium truncate">End Date :</p>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full md:w-[240px] pl-3 text-left font-normal"
                )}
              >
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={value => {
                  if (value) setEndDate(value);
                }}
                disabled={date =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {/* Tabs for filtering orders by status */}
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() =>
              setSortingState(prev => {
                return { ...prev, status: undefined };
              })
            }
            className={`px-4 py-2 rounded-md ${
              sortingState?.status === undefined
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            All Orders
          </button>
          {/* <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "PENDING"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pending
        </button> */}
          <button
            onClick={() =>
              setSortingState(prev => {
                return { ...prev, status: "PROCESSING" };
              })
            }
            className={`px-4 py-2 rounded-md ${
              sortingState?.status === "PROCESSING"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() =>
              setSortingState(prev => {
                return { ...prev, status: "SHIPPED" };
              })
            }
            className={`px-4 py-2 rounded-md ${
              sortingState?.status === "SHIPPED"
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() =>
              setSortingState(prev => {
                return { ...prev, status: "DELIVERED" };
              })
            }
            className={`px-4 py-2 rounded-md ${
              sortingState?.status === "DELIVERED"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() =>
              setSortingState(prev => {
                return { ...prev, status: "CANCELLED" };
              })
            }
            className={`px-4 py-2 rounded-md ${
              sortingState?.status === "CANCELLED"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Cancelled
          </button>
          {/* <button
          onClick={() => setActiveTab("RETURNED")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "RETURNED"
              ? "bg-purple-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Returned
        </button> */}
          {/* <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "COMPLETED"
              ? "bg-gray-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Completed
        </button> */}
        </div>

        {/* <div className="space-y-2 max-w-60 w-full">
          <p className="text-sm font-medium">Interval</p>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time</SelectLabel>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* Orders Table */}
      <div className="bg-white scrollbar-thin max-w-3xl overflow-x-scroll shadow-md rounded-lg ">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                No.
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Order ID
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Customer
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Date
              </th>

              <th className="py-3 px-4 text-left font-semibold text-gray-600 ">
                Delivery Charge
              </th>
              {/* <th className="py-3 px-4 text-left font-semibold text-red-600">
                Total Discount
              </th> */}

              <th className="py-3 px-4 text-left font-semibold text-green-600">
                Total Amount
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Order Status
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {}
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => {
                  return (
                    <tr key={index} className="">
                      <td colSpan={9}>
                        <LoadingContent className="h-6 w-full" />
                      </td>
                    </tr>
                  );
                })
              : orders?.content?.map((order, index) => (
                  <tr key={order.orderId} className="border-t">
                    <td className="py-3 px-4 text-gray-700">
                      {sortingState.currentPage * 10 + (index + 1)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-52 text-wrap">
                      {order?.orderId}
                    </td>
                    <td className="py-3 px-4 text-gray-700 truncate">
                      {order?.customerName}
                    </td>
                    <td className="py-3 px-4 text-gray-700 truncate">
                      {order?.orderDate.slice(0, 10)}
                    </td>

                    <td className="py-3 px-4 text-gray-700 text-center">
                      Rs.{Number(order?.deliveryCharge)?.toFixed(2)}
                    </td>

                    {/* <td className="py-3 px-4 text-red-700 text-center">
                      Rs.{Number(order?.discount)?.toFixed(2)}
                    </td> */}
                    <td className="py-3 px-4 text-green-700 text-center">
                      Rs.
                      {Number(order?.total)?.toFixed(2)}
                    </td>
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
                    <td className="py-4 px-4 flex ">
                      <Dialog
                        open={order.orderId == activeOrderId}
                        onOpenChange={isOpen =>
                          setActiveOrderId(isOpen ? order.orderId : null)
                        }
                        // onClick={() => openModal(order)}
                        // className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md"
                      >
                        <DialogTrigger className={cn(buttonVariants())}>
                          View
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-[90%] sm:max-w-[60%] overflow-y-auto scrollbar-thin">
                          <DialogHeader>
                            <VisuallyHidden>
                              <DialogTitle>Order</DialogTitle>
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

      <div className="flex justify-center space-x-2 mt-4">
        {/* {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            variant={currentPage === index + 1 ? "default" : "outline"}
            onClick={() => handlePageChange(index + 1)}
            // className={`px-3 py-1 rounded ${
            //   currentPage === index + 1
            //     ? "bg-blue-500 text-white"
            //     : "bg-gray-200 text-gray-700"
            // }`}
          >
            {index + 1}
          </Button>
        ))} */}

        {/*  ------------------------ Pagination  ------------------------- */}

        <div className="flex flex-wrap items-center  gap-10   justify-between w-full pt-6 pb-4">
          <div className="flex flex-wrap  items-center gap-2">
            {/* <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="text-sm sm:text-base "
                >
                  {"<<"}
                </Button> */}

            <div className="flex gap-2 ">
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() =>
                  setSortingState(prev => {
                    if (prev.currentPage <= 0) {
                      return prev;
                    }
                    return { ...prev, currentPage: prev.currentPage - 1 };
                  })
                }
                disabled={loading || 0 == sortingState.currentPage}
                className="text-sm sm:text-base "
              >
                <FaChevronLeft />
              </Button>
              {/* {Array.from({ length: endPage - startPage }, (_, index) => (
                    <Button
                      key={index}
                      variant={
                        startPage + index ===
                        table.getState().pagination.pageIndex
                          ? "default"
                          : "outline"
                      }
                      size={"sm"}
                      onClick={() => table.setPageIndex(startPage + index)}
                      className="text-sm sm:text-base "
                    >
                      {startPage + index + 1}
                    </Button>
                  ))} */}
              <div className="flex gap-2">
                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() =>
                    setSortingState(prev => {
                      if (orders?.last) {
                        return prev;
                      }
                      return { ...prev, currentPage: prev.currentPage + 1 };
                    })
                  }
                  disabled={loading || orders?.last}
                  className="text-sm sm:text-base "
                >
                  <FaChevronRight />
                </Button>
              </div>
            </div>
            {/* <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => table.setPageIndex(totalPages - 1)}
                  disabled={!table.getCanNextPage}
                  className="text-sm sm:text-base "
                >
                  {">>"}
                </Button> */}
          </div>
          <div className="  font-medium text-gray-600">
            Total Orders: {orders?.totalElements}
          </div>
        </div>

        {/* Pagination Controls */}
        {/* <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              variant={
                sortingState.currentPage === index ? "default" : "outline"
              }
              onClick={() =>
                setSortingState((prev) => {
                  return { ...prev, currentPage: index };
                })
              }
              // className={`px-3 py-1 rounded ${
              //   currentPage === index + 1
              //     ? "bg-blue-500 text-white"
              //     : "bg-gray-200 text-gray-700"
              // }`}
            >
              {index + 1}
            </Button>
          ))}
        </div> */}

        {/* <Button
          disabled={sortingState.currentPage == 0}
          onClick={() =>
            setSortingState((prev) => {
              return { ...prev, currentPage: prev.currentPage - 1 };
            })
          }
        >
          <FaChevronLeft />
        </Button>
        <Button
          disabled={!isNextAvailable}
          onClick={() =>
            setSortingState((prev) => {
              return { ...prev, currentPage: prev.currentPage + 1 };
            })
          }
        >
          <FaChevronRight />
        </Button> */}
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailModal
          setIsOrderUpdated={setIsOrderUpdated}
          order={selectedOrder}
          closeModal={closeModal}
          setIsUpdated={setIsUpdated}
        />
      )}
    </div>
  );
};

export default AdminOrders;
