"use client";
import React, { useCallback, useEffect, useState } from "react";
import Container from "@/components/(authenticated)/admin/maxWidthWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { LiaEyeSolid } from "react-icons/lia";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getUserFromCookies } from "@/components/cookie/cookie";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { useDebouncedCallback } from "use-debounce";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import AdminList from "./AdminList";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contact: string;
  password: string | null;
  userType: "USER" | "ADMIN" | "SUB_ADMIN";
  signupType: "SYSTEM" | "SOCIAL";
  createdAt: string;
  verified: boolean;
}

interface Filters {
  size: number;
  offset: number;
}

const CustomerList = () => {
  const [sorting, setSorting] = useState([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPageNo, setTotalPageNo] = useState<number>(1);
  const [isNextPageAvailable, setIsNextPageAvailable] =
    useState<boolean>(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<Filters>({
    offset: 0,
    size: 10,
  });
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const user = getUserFromCookies();

  // Fetch customers based on pagination and isUpdated
  useEffect(() => {
    if (searchQuery.length > 0) return; // Skip if searching
    setLoading(true);

    axiosAuthInstance()
      .get("/api/auth/users", {
        params: {
          offset: pagination.offset,
          size: pagination.size + 1,
        },
      })
      .then(response => {
        const fetchedData = response.data;
        setIsNextPageAvailable(fetchedData?.length > pagination.size);
        setData(fetchedData.slice(0, pagination.size));
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error("Error Fetching Users", err);
        // toast.error("Failed to fetch users.");
      });

    axiosAuthInstance()
      .get("/api/auth/total-customers")
      .then(res => {
        const totalCustomers = res.data || 0;
        setTotalPageNo(
          Math.max(1, Math.ceil(totalCustomers / pagination.size))
        );
      })
      .catch(err => {
        console.error("Error fetching total customers", err);
        // toast.error("Failed to fetch total customers.");
      });
  }, [pagination.offset, pagination.size, isUpdated]); // Add pagination dependencies

  // Debounced search API
  const searchApi = useDebouncedCallback(() => {
    if (searchQuery.length === 0) {
      setIsUpdated(prev => !prev); // Trigger regular fetch if search is cleared
      return;
    }
    setLoading(true);
    axiosAuthInstance()
      .get("/api/auth/users/search", {
        params: {
          searchValue: searchQuery,
        },
      })
      .then(res => {
        setData(res.data);
        setIsNextPageAvailable(false); // No pagination for search results
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching search results", err);
        setLoading(false);
        // toast.error("Failed to fetch search results.");
      });
  }, 200);

  useEffect(() => {
    searchApi();
  }, [searchQuery, searchApi]);

  // Update currentPage when pagination.offset changes
  useEffect(() => {
    setCurrentPage(Math.floor(pagination.offset / pagination.size) + 1);
  }, [pagination.offset, pagination.size]);

  // Table Columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "No.",
      cell: ({ row }) => (
        <p>{(currentPage - 1) * pagination.size + row.index + 1}</p>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <p className="truncate">
          {row?.original?.firstName + " " + row?.original?.lastName}
        </p>
      ),
    },
    {
      accessorKey: "userType",
      header: "User Type",
      cell: ({ row }) => <p>{row?.original?.userType}</p>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "userId",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {user.role === "SUPER_ADMIN" && (
            <Dialog
              open={activeModal === row?.original?.userId}
              onOpenChange={value => {
                setActiveModal(value ? row?.original?.userId : null);
              }}
            >
              <DialogTrigger
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <LiaEyeSolid className="text-xl sm:text-2xl" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>
                <Modal row={row} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      ),
    },
  ];

  const Modal = ({ row }: any) => {
    const [role, setRole] = useState<string>(row?.original?.userType);
    const submitRole = (value: string) => {
      axiosAuthInstance()
        .post("/api/auth/update-role", {
          userId: row?.original?.userId,
          userType: value,
        })
        .then(() => {
          toast.success(
            `${
              row?.original?.firstName + " " + row?.original?.lastName
            } is now ${value}`
          );
          setIsUpdated(prev => !prev);
        })
        .catch(err => {
          console.error("Error changing role", err);
          toast.error("Failed to change role.");
        });
    };

    return (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Details:</p>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Name:
            </strong>{" "}
            {row?.original?.firstName + " " + row?.original?.lastName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Contact:
            </strong>{" "}
            {row?.original?.contact || "-"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Email:
            </strong>{" "}
            {row?.original?.email || "-"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Address:
            </strong>{" "}
            {row?.original?.address || "-"}
          </p>
        </div>
        {(role === "USER" || role === "SUB_ADMIN") && (
          <div className="flex flex-col gap-2 mt-1">
            <p className="font-semibold">Change Role:</p>
            <Select
              value={role}
              onValueChange={value => {
                setRole(value);
                submitRole(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SUB_ADMIN">Sub-Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handlePreviousPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.size),
    }));
  };

  const handleNextPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.size,
    }));
  };

  return (
    <Container className="w-full px-0 md:px-0 mx-0">
      <AdminList isUpdated={isUpdated} setIsUpdated={setIsUpdated} />
      <div className="flex flex-col gap-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">Customer List</h1>
        </div>
        <Card className="p-4">
          <div className="pb-4 flex flex-wrap lg:flex-nowrap w-full gap-2 md:gap-5 justify-between items-center">
            <div className="flex flex-col items-start gap-2 md:gap-5 w-full md:flex-row md:items-center lg:flex-row lg:items-center">
              <div className="flex w-full gap-2 px-2 md:px-3 items-center border rounded-md focus-within:ring-ring focus-within:ring-2">
                <Input
                  placeholder="Search Name"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full border-none outline-none focus-visible:ring-0 focus:ring-blue-500 text-xs sm:text-base"
                />
                <CiSearch className="size-6" />
              </div>
            </div>
          </div>
          <div>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup, index) => (
                  <TableRow key={index}>
                    {headerGroup.headers.map((header, i) => (
                      <TableHead
                        key={i}
                        className="font-medium text-gray-600 truncate"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="font-medium">
                {loading ? (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={10} className="h-12 w-full">
                          <LoadingContent />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow key={index}>
                      {row.getVisibleCells().map((cell, i) => (
                        <TableCell key={i}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center gap-10 justify-between pt-6 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={
                  pagination.offset === 0 || loading || searchQuery.length > 0
                }
                className="text-sm sm:text-base"
              >
                <FaChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  !isNextPageAvailable || loading || searchQuery.length > 0
                }
                className="text-sm sm:text-base"
              >
                <FaChevronRight />
              </Button>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">
              Showing {data.length} of {pagination.size} entries
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default CustomerList;
