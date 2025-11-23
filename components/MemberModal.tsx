"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "./providers/ModalStateProvider";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { axiosAuthInstance } from "./axiosInstance";
import {
  DeliveryOptionDetails,
  ShippingDetails,
} from "./(non-authenticated)/Checkout";
import { getUserFromCookies } from "./cookie/cookie";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export interface Plan {
  planId: string;
  planName: string;
  description: string;
  discount: number;
  durationInDays: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

const MemberModal = () => {
  const { isMemberModalOpen, setIsMemberModalOpen, plan } = useModal();
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOptionDetails[]>(
    []
  );
  const [selectedDelivery, setSelectedDelivery] = useState<
    string | undefined
  >();
  const [shippingInfo, setShippingInfo] = useState<ShippingDetails[]>();
  const [selectedAddressId, setSelectedAddressId] = useState<string>();
  const user = getUserFromCookies();
  const router = useRouter();

  // Fetch delivery options from the API
  useEffect(() => {
    if (user) {
      axiosAuthInstance()
        .get("/api/shipping/info/by-user")
        .then((res) => {
          setShippingInfo(res.data);
          const shippingDet: ShippingDetails[] = res.data;
          setSelectedAddressId(shippingDet?.[0]?.shippingId);
        })
        .catch((err) => console.error("Error fetching shipping data", err));

      axiosAuthInstance()
        .get("/api/delivery/")
        .then((res) => {
          setDeliveryOption(res.data);
          setSelectedDelivery(res?.data[0]?.optionId);
        })
        .catch((err) => console.error("Error fetching delivery Options", err));
    }
  }, []);

  const handleClick = () => {
    axiosAuthInstance()
      .post("/api/memberships/", {
        planName: plan?.planName,
        shippingInfo: selectedAddressId,
      })
      .then((res) => {
          toast.dismiss();
        toast.success("Payment in progress...");
        router.push(res.data?.paymentUrl);
      })
      .catch((err) => {
          toast.dismiss();
        toast.error("Please try again later");
        console.error("Error creating membership", err);
      });
  };

  return (
    <div className="h-0">
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogTrigger className="h-0"></DialogTrigger>
        <DialogContent className="max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Member Register</DialogTitle>
          </DialogHeader>
          <div className="font-semibold">
            Plan: {plan ? plan.planName : "Choose a Plan First"}
          </div>
          <p className="font-semibold">* Select your Current Address</p>
          <div className="flex flex-col gap-2  max-h-[48vh] overflow-y-auto">
            {shippingInfo?.map((address, index) => {
              const id = `address-${index}`;

              return (
                <div
                  key={index}
                  className="flex gap-2 items-start p-4 border border-gray-300 rounded-lg hover:bg-muted"
                >
                  {/* Radio Button */}
                  <input
                    type="radio"
                    id={id}
                    name="address" // Grouping all radio buttons
                    value={address?.shippingId}
                    checked={selectedAddressId == address?.shippingId}
                    onChange={(e) => {
                      // console.log(e.target.value);
                      setSelectedAddressId(e.target.value);
                    }}
                    className="mt-2"
                  />

                  {/* Label for the radio button */}
                  <Label
                    htmlFor={id} // Associates label with the radio button
                    className="flex flex-col cursor-pointer w-full "
                  >
                    <span className="font-semibold text-lg">
                      {address?.address}
                    </span>
                    <span className="text-sm ">{address?.addressType}</span>
                    <span className="text-sm ">{address?.phoneNumber}</span>
                    <span className="text-sm ">{address?.postalCode}</span>
                  </Label>

                  {/* Custom Checkmark for radio */}
                </div>
              );
            })}
          </div>
          <Button onClick={handleClick}>Become a Member</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberModal;
