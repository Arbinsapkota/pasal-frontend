import { useRouter } from "next/navigation";
import AdminSettingHeader from "./AdminSettingHeader";
import UserDetails from "./UserDetails";

function AdminSettingPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="mx-auto">
      <AdminSettingHeader />
      <button
        onClick={handleBackClick}
        className="m-4 bg-orange-500 rounded-sm px-3 py-1 text-white transition-transform duration-300 ease-in-out hover:bg-orange-600 hover:scale-105"
      >
        Back
      </button>
      <UserDetails />
    </div>
  );
}

export default AdminSettingPage;
