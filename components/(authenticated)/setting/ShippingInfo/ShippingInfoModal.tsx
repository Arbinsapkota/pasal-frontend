import { getTokenFromCookies } from "@/components/cookie/cookie";
import useUserData from "@/components/providers/UserProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import ShippingInfoList from "./ShiippingInfoList";

const ShippingInfoModal: React.FC = () => {
  const { user } = useUserData();
  const [open, setOpen] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    addressType: "ALTERNATIVE", // Default value for address type
    phoneNumber: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Type assertion for the name field to be one of the keys of shippingInfo
    setShippingInfo(prevState => ({
      ...prevState,
      [name as keyof typeof shippingInfo]: value, // Type assertion here
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getTokenFromCookies();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipping/info/`,
        {
          users: { userId: user?.userId },
          ...shippingInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsAdded(prev => !prev);
      setIsDialogOpen(false);
      if (response.status === 201) {
        toast.success("Shipping information added successfully");

        handleClose();
      }
    } catch (error) {
      toast.error("Error adding shipping information");
      console.error("Error adding shipping information:", error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true); // Open the modal
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
    setShippingInfo({
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      addressType: "PRIMARY",
      phoneNumber: "",
    });
  };

  const handleEditShipping = (info: any) => {
    setShippingInfo(info);
    setIsDialogOpen(true);
  };

  return (
    <div className={""}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className={cn(buttonVariants())}>
          {/* <button
        className="primary-btn rounded-md p-2 text-white"
        onClick={handleClickOpen}
        > */}
          Add Shipping Info
          {/* </button> */}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-[90%] sm:max-w-[40%] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>
              <h2 className="text-2xl font-semibold mb-4">
                Add Shipping Information
              </h2>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white  rounded-lg w-full  ">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="addressType"
                  className="block text-sm font-medium"
                >
                  Address Type
                </label>
                <select
                  id="addressType"
                  name="addressType"
                  value={shippingInfo.addressType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {/* <option value="PRIMARY">Primary</option> */}
                  <option value="ALTERNATIVE">Alternative</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="state" className="block text-sm font-medium">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

             

              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={shippingInfo.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-between">
                {/* <button
                  type="button"
                  onClick={handleClose}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                >
                  Cancel
                </button> */}
                <Button type="submit" className="w-full mt-2">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <ShippingInfoList isAdded={isAdded} onEdit={handleEditShipping} />
    </div>
  );
};

export default ShippingInfoModal;
