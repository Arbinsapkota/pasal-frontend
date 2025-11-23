import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Dispatch } from "react";
import { toast } from "react-toastify";

type GymMember = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Deactive";
};

type DataTableProps = {
  data: User[];
  onEdit: (member: GymMember) => void;
  onRemove: (id: string) => void;
  // onToggleStatus: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>;
};

// export interface User {
//   userId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   address: string;
//   contact: string;
//   createdAt: string; // Use `Date` if this will be parsed to a Date object
//   password: string | null;
//   userType: "USER" | "ADMIN" | "MEMBER" | "GUEST"; // Add more user types as needed
//   verified: boolean;
// }
interface User {
  id: string;
  firstName: string;
  lastName: string;
  shippingInfo: ShippingInfo | null;
  memberShipList: Membership[] | null;
  email: string;
}

interface ShippingInfo {
  // Add properties here if `shippingInfo` has details; otherwise, leave it empty.
}

interface Membership {
  id: string;
  users: User | null;
  shippingInfo: ShippingInfo | null;
  planName: string;
  price: number;
  membershipStartDate: string; // ISO 8601 date string
  membershipEndDate: string; // ISO 8601 date string
  membershipStatus: string;
  updatedAt: string; // ISO 8601 date string
}

// interface MembersList {
//   members: Member[];
// }

export function formatDate(dateString: string): string {
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

const DataTable = ({
  data,
  onEdit,
  onRemove,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  setIsUpdated,
}: DataTableProps) => {
  const activateMember = (userId: string, membershipId: string) => {
    axiosAuthInstance()
      .post("/api/memberships/update-status", {
        users: {
          userId: userId,
        },
        membershipStatus: "ACTIVE",
        id: membershipId,
      })
      .then((res) => {
        toast.success("Membership Activated Successfully.");
        setIsUpdated((prev) => !prev);
      })
      .catch((err) => {
        toast.error("Failed to Actiavte Membership. ");
      });
  };

  const deactivateMember = (userId: string, membershipId: string) => {
    axiosAuthInstance()
      .post("/api/memberships/update-status", {
        users: {
          userId: userId,
        },
        membershipStatus: "INACTIVE",
        id: membershipId,
      })
      .then((res) => {
        toast.success("Membership Deactivated Successfully.");
        setIsUpdated((prev) => !prev);
      })
      .catch((err) => {
        toast.error("Failed to Deactivate Membership. ");
      });
  };
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            {/* <th className="border px-4 py-2">Joining Date</th> */}
            {/* <th className="border px-4 py-2">End Date</th> */}
            <th className="border px-4 py-2">Status</th>

            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => {
                return (
                  <tr key={index}>
                    <td className="border px-4 py-2 text-center">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                  </tr>
                );
              })
            : data.map((member, index) => (
                <tr key={member.id}>
                  <td className="border px-4 py-2 text-center">{index + 1}</td>
                  <td className="border px-4 py-2 text-center truncate">
                    {member.firstName + " " + member.lastName}
                  </td>
                  {/* <td className="border px-4 py-2">{member.createdAt}</td> */}
                  {/* <td className="border px-4 py-2">{member.}</td> */}
                  {/* <td className="border px-4 py-2 mx-auto text-center">
                    {member?.memberShipList?.[0]?.membershipStartDate
                      ? new Date(
                          member?.memberShipList?.[0]?.membershipStartDate
                        ).toLocaleDateString()
                      : "-"}
                  </td> */}
                  {/* <td className="border px-4 py-2 mx-auto text-center">
                    {member?.memberShipList?.[0]?.membershipStartDate
                      ? new Date(
                          member?.memberShipList?.[0]?.membershipEndDate
                        ).toLocaleDateString()
                      : "-"}
                  </td> */}
                  <td className="border px-4 py-2 mx-auto text-center">
                    {member?.memberShipList?.[0]?.membershipStatus}
                  </td>
                  <td className="border px-4 py-2 text-center flex items-center gap-2 mx-auto justify-center">
                    {/* <button
                    onClick={() => onEdit(member)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    aria-label={`Edit member ${member.name}`}
                  >
                    Edit
                  </button> */}
                    <Dialog>
                      <DialogTrigger
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "px-4 py-2 text-sm font-medium w-28"
                        )}
                      >
                        View
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] w-full max-w-2xl p-6 overflow-y-auto rounded-lg shadow-md scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Member Details
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong className="font-medium text-gray-800 dark:text-gray-200">
                                User ID:
                              </strong>{" "}
                              {member.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong className="font-medium text-gray-800 dark:text-gray-200">
                                Name:
                              </strong>{" "}
                              {member.firstName + " " + member.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong className="font-medium text-gray-800 dark:text-gray-200">
                                Email:
                              </strong>{" "}
                              {member?.email || "Not provided"}
                            </p>
                          </div>

                          {member &&
                            member?.memberShipList &&
                            member?.memberShipList?.length > 0 && (
                              <div>
                                <strong className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                                  Plans:
                                </strong>
                                <div className="space-y-4">
                                  {member.memberShipList.map((plan, index) => (
                                    <div
                                      key={index}
                                      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    >
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="font-medium text-gray-800 dark:text-gray-200">
                                          Plan Name:
                                        </strong>{" "}
                                        {plan?.planName}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="font-medium text-gray-800 dark:text-gray-200">
                                          Price:
                                        </strong>{" "}
                                        ${plan?.price}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="font-medium text-gray-800 dark:text-gray-200">
                                          Start Date:
                                        </strong>{" "}
                                        {formatDate(plan?.membershipStartDate)}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="font-medium text-gray-800 dark:text-gray-200">
                                          End Date:
                                        </strong>{" "}
                                        {formatDate(plan?.membershipEndDate)}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="font-medium text-gray-800 dark:text-gray-200">
                                          Status:
                                        </strong>{" "}
                                        {plan?.membershipStatus}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Button
                                          className="w-28"
                                          onClick={() => {
                                            activateMember(member.id, plan?.id);
                                          }}
                                          disabled={
                                            plan?.membershipStatus == "ACTIVE"
                                          }
                                        >
                                          Activate
                                        </Button>
                                        <Button
                                          variant={"destructive"}
                                          className="w-28"
                                          onClick={() => {
                                            deactivateMember(
                                              member.id,
                                              plan?.id
                                            );
                                          }}
                                          disabled={
                                            plan?.membershipStatus == "INACTIVE"
                                          }
                                        >
                                          Deactivate
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {member?.memberShipList?.length === 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              No active plans available.
                            </p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* <button
                    onClick={() => onToggleStatus(member.id)}
                    className={`${
                      member.status === "Active" ? "bg-yellow-500" : "bg-green-500"
                    } text-white px-4 py-2 rounded`}
                  >
                    {member.status === "Active" ? "Deactivate" : "Activate"}
                  </button> */}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {/* <div className="mt-4 flex justify-between items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Previous
        </button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default DataTable;
