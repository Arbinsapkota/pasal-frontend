"use client";
import React, { useEffect, useState } from "react";
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPageNo, setTotalPageNo] = useState<number>(1);
  const [isNextPageAvailable, setIsNextPageAvailable] = useState<boolean>(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<Filters>({ offset: 0, size: 10 });
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const user = getUserFromCookies();

  // Fetch customers
  useEffect(() => {
    if (searchQuery.length > 0) return;
    setLoading(true);

    axiosAuthInstance()
      .get("/api/auth/users", { params: { offset: pagination.offset, size: pagination.size + 1 } })
      .then(response => {
        const fetchedData = response.data;
        setIsNextPageAvailable(fetchedData?.length > pagination.size);
        setData(fetchedData.slice(0, pagination.size));
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error("Error Fetching Users", err);
      });

    axiosAuthInstance()
      .get("/api/auth/total-customers")
      .then(res => {
        const totalCustomers = res.data || 0;
        setTotalPageNo(Math.max(1, Math.ceil(totalCustomers / pagination.size)));
      })
      .catch(err => console.error("Error fetching total customers", err));
  }, [pagination.offset, pagination.size, isUpdated]);

  const searchApi = useDebouncedCallback(() => {
    if (searchQuery.length === 0) {
      setIsUpdated(prev => !prev);
      return;
    }
    setLoading(true);
    axiosAuthInstance()
      .get("/api/auth/users/search", { params: { searchValue: searchQuery } })
      .then(res => {
        setData(res.data);
        setIsNextPageAvailable(false);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching search results", err);
        setLoading(false);
      });
  }, 200);

  useEffect(() => { searchApi(); }, [searchQuery, searchApi]);
  useEffect(() => { setCurrentPage(Math.floor(pagination.offset / pagination.size) + 1); }, [pagination.offset, pagination.size]);

  const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "No.", cell: ({ row }) => <p>{(currentPage - 1) * pagination.size + row.index + 1}</p> },
    { accessorKey: "name", header: "Name", cell: ({ row }) => <p className="truncate font-semibold text-gray-800 dark:text-gray-100">{row?.original?.firstName} {row?.original?.lastName}</p> },
    {
      accessorKey: "userType",
      header: "User Type",
      cell: ({ row }) => (
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold transition-transform duration-200",
          row?.original?.userType === "ADMIN" ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md" :
          row?.original?.userType === "SUB_ADMIN" ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md" :
          "bg-gray-200 text-gray-800"
        )}>
          {row?.original?.userType}
        </span>
      ),
    },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <p className="text-gray-700 dark:text-gray-300">{row?.original?.email}</p> },
    {
      accessorKey: "userId",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {user.role === "SUPER_ADMIN" && (
            <Dialog open={activeModal === row?.original?.userId} onOpenChange={value => setActiveModal(value ? row?.original?.userId : null)}>
              <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "hover:scale-105 transition-transform")}>
                <LiaEyeSolid className="text-xl sm:text-2xl" />
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-xl shadow-2xl p-5 bg-white dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Customer Details</DialogTitle>
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
        .post("/api/auth/update-role", { userId: row?.original?.userId, userType: value })
        .then(() => {
          toast.success(`${row?.original?.firstName} ${row?.original?.lastName} is now ${value}`);
          setIsUpdated(prev => !prev);
        })
        .catch(() => toast.error("Failed to change role."));
    };
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Details:</p>
        <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-inner">
          <p className="text-sm"><strong>Name:</strong> {row?.original?.firstName} {row?.original?.lastName}</p>
          <p className="text-sm"><strong>Contact:</strong> {row?.original?.contact || "-"}</p>
          <p className="text-sm"><strong>Email:</strong> {row?.original?.email || "-"}</p>
          <p className="text-sm"><strong>Address:</strong> {row?.original?.address || "-"}</p>
        </div>
        {(role === "USER" || role === "SUB_ADMIN") && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-sm font-semibold">Change Role:</p>
            <Select value={role} onValueChange={v => { setRole(v); submitRole(v); }}>
              <SelectTrigger className="w-[180px] border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition">
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

  const handlePreviousPage = () => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.size) }));
  const handleNextPage = () => setPagination(prev => ({ ...prev, offset: prev.offset + prev.size }));

  return (
    <Container className="w-full px-0 md:px-0 mx-0">
      <AdminList isUpdated={isUpdated} setIsUpdated={setIsUpdated} />
      <div className="flex flex-col gap-6 py-5 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between sticky top-0 bg-white dark:bg-gray-900 z-20 shadow-md rounded-xl p-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Customer List</h1>
          <div className="flex w-full md:w-auto gap-2 items-center border rounded-lg shadow-sm px-3 py-1 bg-white dark:bg-gray-800">
            <Input
              placeholder="Search Name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-none outline-none text-sm sm:text-base bg-transparent dark:text-gray-200"
            />
            <CiSearch className="text-lg text-gray-400 dark:text-gray-300" />
          </div>
        </div>

        <Card className="p-4 bg-gradient-to-tr from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 shadow-xl rounded-2xl mt-4">
          <div className="overflow-x-auto rounded-2xl">
            <Table className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
              <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
                {table.getHeaderGroups().map((headerGroup, index) => (
                  <TableRow key={index} className="bg-gray-50 dark:bg-gray-800">
                    {headerGroup.headers.map((header, i) => (
                      <TableHead key={i} className="font-semibold text-gray-600 dark:text-gray-300 truncate">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}><TableCell colSpan={10}><LoadingContent /></TableCell></TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4 text-gray-500 dark:text-gray-400">No customers found.</TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow key={index} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 dark:hover:bg-gray-800 transition-all rounded-lg">
                      {row.getVisibleCells().map((cell, i) => <TableCell key={i}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center gap-10 justify-between pt-6 pb-4">
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={handlePreviousPage} disabled={pagination.offset === 0 || loading || searchQuery.length > 0} className="text-sm sm:text-base">
                <FaChevronLeft />
              </Button>
              <Button variant="default" size="sm" onClick={handleNextPage} disabled={!isNextPageAvailable || loading || searchQuery.length > 0} className="text-sm sm:text-base">
                <FaChevronRight />
              </Button>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Showing {data.length} of {pagination.size} entries
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default CustomerList;
