"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, PlusIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useUserData from "@/components/providers/UserProvider";
import { toast } from "react-toastify";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ShippingInfoList from "./ShippingInfo/ShiippingInfoList";
import { cn } from "@/lib/utils";
import ChangePasswordDialog from "./ChangePasswordDialog";
import ImageDetails from "./ImageDetails";
import LoadingContent from "@/components/loaidng/LoaidngCotent";

const Header: React.FC = () => {
  const { user, loading } = useUserData();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openPersonalDialog, setOpenPersonalDialog] = useState(false);

  // 🚚 Shipping Info State
  const [shippingInfo, setShippingInfo] = useState<any>({
    id: null,
    address: "",
    city: "",
    state: "",
    // postalCode: "",
    // country: "",
    addressType: "ALTERNATIVE",
    phoneNumber: "",
  });

  // 👤 Personal Info State
  const [personalInfo, setPersonalInfo] = useState<any>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // ======================
  // Input Handlers
  // ======================
  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  // ======================
  // Submit Handlers
  // ======================

  // 🚚 Add / Update Shipping Info
  const handleSubmitShipping = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingInfo.state.trim()) {
      toast.error("State is required.");
      return; // stop form submission
    }
    setIsLoading(true);
    try {
      const token = getTokenFromCookies();
      const url = shippingInfo.shippingId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping/info/`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping/info/`;
      const method = shippingInfo.shippingId ? "post" : "post";

      const response = await axios[method](
        url,
        { users: { userId: user?.userId }, ...shippingInfo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsAdded(prev => !prev);
      setIsDialogOpen(false);

      if (response.status === 200 || response.status === 201) {
        toast.dismiss();
        toast.success(
          shippingInfo.shippingId
            ? "Shipping information updated successfully"
            : "Shipping information added successfully"
        );
        handleCloseShipping();
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error saving shipping information");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 👤 Update Personal Info
  // const handleSubmitPersonal = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     const token = getTokenFromCookies();
  //     const response = await axios.put(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${user?.userId}/`,
  //       personalInfo,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Personal information updated successfully");
  //       setOpenPersonalDialog(false);
  //     }
  //   } catch (error) {
  //     toast.error("Error updating personal information");
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ======================
  // Helper Functions
  // ======================
  const handleCloseShipping = () => {
    setShippingInfo({
      id: null,
      address: "",
      city: "",
      state: "",
      // postalCode: "",
      // country: "",
      addressType: "ALTERNATIVE",
      phoneNumber: "",
    });
  };

  const handleEditShipping = (info: any) => {
    setShippingInfo(info);
    setIsDialogOpen(true);
  };

  const handleOpenPasswordDialog = () => setOpenPasswordDialog(true);
  const handleClosePasswordDialog = () => setOpenPasswordDialog(false);

  // ======================
  // UI
  // ======================
  return (
    <div className="w-full p-4">
      {/* =============== PROFILE CARD =============== */}
      <Card className="mb-6">
        <CardHeader className="bg-white shadow-sm rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user?.profileImageUrl ? (
                  <>
                    <Image
                      src={user.profileImageUrl || "/placeholder.svg"}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-100"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                          <Pencil size={16} className="text-gray-600" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <ImageDetails />
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center relative">
                    {loading ? (
                      <LoadingContent className="h-[20px] w-[140px]" />
                    ) : (
                      <span className="text-xl font-medium text-gray-700">
                        {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                {loading ? (
                  <LoadingContent className="h-[25px] w-[150px]" />
                ) : (
                  <p className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* =============== PERSONAL INFO =============== */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          {/* <Dialog
            open={openPersonalDialog}
            onOpenChange={setOpenPersonalDialog}
          >
            <DialogTrigger className="flex items-center gap-1 text-sm px-2 py-1 border rounded">
              <Pencil size={14} />
              Edit
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Personal Info</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitPersonal} className="space-y-4">
                <div>
                  <label className="block text-sm">First Name</label>
                  <input
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm">Last Name</label>
                  <input
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={handlePersonalChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </DialogContent>
          </Dialog> */}
        </CardHeader>
        <CardContent>
          <div className="sm:grid sm:grid-cols-2 gap-6 ">
            <div>
              <p className="text-sm text-gray-500 sm:mb-1 -mb-1">Full Name</p>
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 sm:mb-1 -mb-1">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <button
                onClick={handleOpenPasswordDialog}
                className="bg-blue-600 text-white px-2 py-2 mt-2 rounded"
              >
                Change Password
              </button>
              {openPasswordDialog && (
                <ChangePasswordDialog onClose={handleClosePasswordDialog} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =============== SHIPPING INFO =============== */}
      <Card>
        <div className="flex justify-between items-center px-6 p-2 mt-5">
          <p className="text-lg font-semibold">Shipping Information</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              className={cn(
                buttonVariants({ variant: "default" }),
                "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md"
              )}
              onClick={handleCloseShipping}
            >
              <PlusIcon className="w-4 h-4 " />
              Add Shipping Info
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-[90%] sm:max-w-[40%] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {shippingInfo.sippingId
                    ? "Edit Shipping Information"
                    : "Add Shipping Information"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmitShipping}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div className="sm:col-span-2">
                  <label className="block text-sm">Address Type</label>
                  <select
                    name="addressType"
                    value={shippingInfo.addressType}
                    onChange={handleShippingChange}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="ALTERNATIVE">Alternative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Address</label>
                  <input
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">City</label>
                  <input
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">State</label>
                  <select
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  >
                    <option value="">Select State</option>
                    <option value="Bagmati">Bagmati</option>
                    <option value="Gandaki">Gandaki</option>
                    <option value="Lumbini">Lumbini</option>
                    <option value="Koshi">Koshi</option>
                    <option value="Madhesh">Madhesh</option>
                    <option value="Karnali">Karnali</option>
                    <option value="Sudurpashchim">Sudurpashchim</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm">Postal Code</label>
                  <input
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingChange}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm">Country</label>
                  <input
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                  />
                </div> */}
                <div>
                  <label className="block text-sm">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleShippingChange}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading
                      ? "Submitting..."
                      : shippingInfo.shippingId
                      ? "Update Info"
                      : "Add Info"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* List Component with Edit Support */}
        <ShippingInfoList isAdded={isAdded} onEdit={handleEditShipping} />
      </Card>
    </div>
  );
};

export default Header;
