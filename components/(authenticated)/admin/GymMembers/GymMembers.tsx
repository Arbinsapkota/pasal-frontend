import { useEffect, useState } from "react";
import DataTable from "./datatable"; // Adjust path accordingly
import { GymMember } from "./column"; // Adjust path accordingly
import axios from "axios";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import { axiosAuthInstance } from "@/components/axiosInstance";

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

const GymMembers = () => {
  const token = getTokenFromCookies();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [members, setMembers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<GymMember | null>(null);
  const [isUpdated, setIsUpdated] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/memberships/gym-members`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      .then((response) => {
        setMembers(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch gym members:", error);
        setIsLoading(false);
      });
  }, [isUpdated]);

  useEffect(() => {
    axiosAuthInstance()
      .get("/api/auth/users")
      .then(() => {})
      .catch((err) => console.error("Error fetching users"));
  }, []);

  const handleEdit = (member: GymMember) => {
    setEditMember(member);
    setFormData({
      name: member.name,
      startDate: member.startDate,
      endDate: member.endDate,
    });
    setIsModalOpen(true);
  };

  const handleRemove = (id: string) => {
    setMembers((prevData) => prevData.filter((member) => member.id !== id));
  };

  // const handleToggleStatus = (id: number) => {
  //   setMembers((prevData) =>
  //     prevData.map((member) =>
  //       member.userId === id
  //         ? {
  //             ...member,
  //             status: member.status === "Active" ? "Deactive" : "Active",
  //           }
  //         : member
  //     )
  //   );
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleFormSubmit = () => {
  //   if (editMember) {
  //     const updatedData = members.map((member) =>
  //       member.userId === editMember.id
  //         ? {
  //             ...member,
  //             name: formData.name,
  //             startDate: formData.startDate,
  //             endDate: formData.endDate,
  //           }
  //         : member
  //     );
  //     setMembers(updatedData);
  //     setIsModalOpen(false);
  //     setEditMember(null);
  //   }
  // };

  const totalPages = Math.ceil(members.length / itemsPerPage);

  return (
    <div className="max-w-full p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">Gym Members</h1>

      {/* DataTable */}
      <DataTable
        data={members}
        onEdit={handleEdit}
        onRemove={handleRemove}
        // onToggleStatus={handleToggleStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        setIsUpdated={setIsUpdated}
      />

      {/* Modal for editing */}
      {isModalOpen && editMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full sm:w-96 md:w-1/3 lg:w-1/4">
            <h2 className="text-xl mb-4">Edit Gym Member</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border w-full p-2 mt-2 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="border w-full p-2 mt-2 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  End Date:
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="border w-full p-2 mt-2 rounded-md"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>
                {/* <button
                  onClick={handleFormSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Save Changes
                </button> */}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymMembers;
