type Column<T> = {
  header: string;
  accessor: keyof T | "action";
  render?: (item: T) => React.ReactNode;
};

export type GymMember = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Deactive";
};

export const columns: Column<GymMember>[] = [
  { header: "ID", accessor: "id" },
  { header: "Name", accessor: "name" },
  { header: "Start Date", accessor: "startDate" },
  { header: "End Date", accessor: "endDate" },
  { header: "Status", accessor: "status" },
  {
    header: "Action",
    accessor: "action",
    render: (item) => (
      <div className="flex gap-2 items-center">
        <button className="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
        <button className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
        <button className="px-2 py-1 bg-gray-500 text-white rounded">
          {item.status === "Active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    ),
  },
];
  