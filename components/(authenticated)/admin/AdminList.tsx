"use client";
import Container from "@/components/(authenticated)/admin/maxWidthWrapper";
import React, { useCallback, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { getUserFromCookies } from "@/components/cookie/cookie";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { SetStateAction, useState } from "react";
import { LiaEyeSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contact: string;
  password: string | null;
  userType: "USER" | "ADMIN"; // Adjust the possible values if there are more types
  signupType: "SYSTEM" | "SOCIAL"; // Adjust based on other signup types if applicable
  createdAt: string; // ISO date string format
  verified: boolean;
}

const AdminList = ({
  isUpdated,
  setIsUpdated,
}: {
  isUpdated: boolean;
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
}) => {
  //   const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeModal, setActiveModal] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPageNo, setTotalPageNo] = useState<number>(0);
  const user = getUserFromCookies();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isAdminUpdated, setIsAdminUpdated] = useState<boolean>(false);
  // const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state

  const userDetails: any = getUserFromCookies();

  // ---------------------- Get all the Customers ---------------------------- //
  useEffect(() => {
    setLoading(true);

    axiosAuthInstance()
      .get("/api/auth/admins", {
        params: {
          offset: currentPage - 1,
          size: 10,
        },
      })
      .then(response => {
        setData(response.data);
        // console.log(userDetails);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error("Error Fetching Products", err);
      });

    axiosAuthInstance()
      .get(`/api/auth/total-customers`)
      .then(res => {
        if (res.data == 0) {
          setTotalPageNo(1);
        } else {
          setTotalPageNo(Math.ceil(res.data / 10));
        }
      })
      .catch(err => {
        console.error("Error fetching Total Number of Customers", err);
      });
  }, [isAdminUpdated, currentPage, isUpdated]);

  // const searchApi = useCallback(
  //   useDebouncedCallback(() => {
  //     axiosAuthInstance()
  //       .get("/api/auth/users/search", {
  //         params: {
  //           searchValue: searchQuery,
  //         },
  //       })
  //       .then(res => {
  //         setData(res.data);
  //         setLoading(false);
  //       })
  //       .catch(err => {
  //         console.error("Error fetching orders", err);

  //         setLoading(false);
  //       });

  //     if (searchQuery.length == 0) {
  //       setLoading(true);
  //       setIsAdminUpdated(prev => !prev);
  //     }
  //   }, 200),
  //   []
  // );

  useEffect(() => {
    setLoading(true);
    // searchApi();
  }, []);

  // ------------------------ Table Columns -------------------------//

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "No.",
      cell: ({ row }) => (
        <>
          <p className="">{(currentPage - 1) * 10 + (row.index + 1)}</p>
        </>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <>
          <p className="truncate">
            {row?.original?.firstName + " " + row?.original?.lastName}
          </p>
        </>
      ),
    },

    {
      accessorKey: "userType",
      header: "User Type",
      cell: ({ row }) => <p className="">{row?.original?.userType}</p>,
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
          {user.role == "SUPER_ADMIN" && (
            <Dialog
              open={activeModal == row?.original?.userId}
              onOpenChange={value => {
                setActiveModal(value ? row?.original?.userId : null);
              }}
            >
              <DialogTrigger
                className={cn(buttonVariants({ variant: "outline" }), "")}
              >
                <LiaEyeSolid className="text-xl sm:text-2xl" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customer </DialogTitle>
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
    function submitRole(value: string) {
      axiosAuthInstance()
        .post("/api/auth/update-role", {
          userId: row?.original?.userId,
          userType: value,
        })
        //   Promise.resolve({ data: { success: true } })
        .then(() => {
          toast.success(
            `${
              row?.original?.firstName + " " + row?.original?.lastName
            } is now ${value}`
          );
          setIsAdminUpdated(prev => !prev);
          setIsUpdated(prev => !prev);
        })
        .catch(() => {
          console.error("Error changing role.");
          toast.dismiss();
          toast.error("Something went wrong.");
        });
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Details:</p>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Name:{" "}
            </strong>{" "}
            {row?.original?.firstName + " " + row?.original?.lastName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Contact:
            </strong>{" "}
            {row?.original?.contact ? row?.original?.contact : "-"}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Email:
            </strong>{" "}
            {row?.original?.email ? row?.original?.email : "-"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              Address:
            </strong>{" "}
            {row?.original?.address ? row?.original?.address : "-"}
          </p>
        </div>
        {(role == "USER" || role == "SUB_ADMIN") && (
          <div className="flex flex-col gap-2 mt-1 ">
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

  // ------------------------ Table Definition -------------------------//

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      sorting,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // const pageSizeHeight: { [key: number]: string } = {
  //   5: "315px",
  //   10: "580px",
  //   20: "1110px",
  // };

  // const currentPageSizeHeight =
  //   pageSizeHeight[table.getState().pagination.pageSize] || "500px";

  // const totalPages = table.getPageCount();
  // const maxPageButtons = 5;
  // const startPage = Math.max(
  //   0,
  //   Math.min(
  //     Math.max(pagination.pageIndex - Math.floor(maxPageButtons / 2), 0),
  //     totalPages - maxPageButtons
  //   )
  // );

  // const endPage = Math.min(totalPages, startPage + maxPageButtons);

  return (
    <>
      {/* Max Width Wrapper/Container */}
      <Container className={` w-full px-0 md:px-0 mx-0 `}>
        <div className=" flex flex-col gap-6 py-5">
          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between ">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Admin and Sub-Admin List
            </h1>
          </div>
          {/*  ------------------------ Table  ------------------------- */}
          <Card className="p-4">
            <div className="pb-4 flex flex-wrap lg:flex-nowrap  w-full gap-2 md:gap-5 justify-between items-center">
              <div
                className={`flex flex-col items-start gap-2 md:gap-5 w-full md:flex-row md:items-center lg:flex-row  lg:items-center`}
              >
                {/*  ------------------------ Search ------------------------- */}

                {/* <div className="flex  w-full  gap-2  px-2  md:px-3  items-center border  rounded-md focus-within:ring-ring    focus-within:ring-2">
                  <Input
                    placeholder="Search Name "
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full border-none outline-none focus-visible:ring-0 text-xs sm:text-base"
                  />
                  <CiSearch className="size-6" />
                </div> */}
                {/*  ------------------------ Filter  ------------------------- */}

                {/* <div className="flex justify-end">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter</SelectLabel>
                        <SelectItem
                          value="name"
                          onClick={() => setSearchQuery("name")}
                        >
                          Name
                        </SelectItem>
                        <SelectItem
                          value="userType"
                          onClick={() => setSearchQuery("userType")}
                        >
                          User Type
                        </SelectItem>
                        <SelectItem
                          value="email"
                          onClick={() => setSearchQuery("email")}
                        >
                          Email
                        </SelectItem>
                        
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </div>
            {/*  ------------------------ Table  ------------------------- */}

            <div className="">
              <Table className="">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup, index) => (
                    <TableRow key={index}>
                      {headerGroup.headers.map((header, i) => (
                        <TableHead
                          key={i}
                          className="font-medium text-gray-600 truncate "
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
                <TableBody className="font-medium ">
                  {loading ? (
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <TableRow className="" key={index}>
                          <TableCell colSpan={10} className=" h-12 w-full">
                            <LoadingContent />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow key={index} className="">
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
            {/*  ------------------------ Pagination  ------------------------- */}

            <div className="flex flex-wrap items-center gap-10   justify-between  pt-6 pb-4">
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
                  {/* <Button
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={loading || 1 == currentPage}
                    className="text-sm sm:text-base "
                  >
                    <FaChevronLeft />
                  </Button> */}
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
                  {/* <div className="flex gap-2">
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={loading || totalPageNo == currentPage}
                      className="text-sm sm:text-base "
                    >
                      <FaChevronRight />
                    </Button>
                  </div> */}
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
              {/* <div className=" text-xs sm:text-sm font-medium text-gray-600">
                Showing {table.getState().pagination.pageSize} entries
              </div> */}
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
};

export default AdminList;
