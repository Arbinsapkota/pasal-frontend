import React, { useState, useEffect, SetStateAction } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { axiosAuthInstance } from "@/components/axiosInstance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { MdDelete, MdEdit } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the Coupon type for TypeScript

interface Coupon {
  code: string; // Coupon code
  couponId: string; // Unique identifier for the coupon
  createdAt: string | null; // Creation timestamp (nullable)
  description: string; // Description of the coupon
  discountAmount: number; // Discount amount
  discountType: "FIXED" | "PERCENTAGE"; // Type of discount
  isActive: boolean; // Whether the coupon is active
  maxDiscountAmount: number; // Maximum discount amount (useful for percentage discounts)
  minimumOrderAmount: number; // Minimum order amount to use the coupon
  updatedAt: Date; // Last update timestamp
  validFrom: Date; // Start validity timestamp
  validUntil: Date; // End validity timestamp
}

// CouponList Component
const CouponList = ({
  setIsUpdated,
  isUpdated,
}: {
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
  isUpdated: boolean;
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [actionLoading, setActionLoading] = useState(false); // For individual actions like delete or edit
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null); // Track the ID of the coupon being edited
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null); // Track the ID of the coupon being deleted
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  // Fetch coupons
  useEffect(() => {
    setIsLoading(true);
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupon/`
        );
        setCoupons(response.data);
        setError(null);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load coupons.");
        setIsLoading(false);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    if (typeof window !== "undefined") {
      fetchCoupons();
    }
  }, [isUpdated]);

  // Handle delete coupon
  const handleDelete = async () => {
    if (!couponToDelete) return;
    setActionLoading(true);
    axiosAuthInstance()
      .delete(`/api/coupon/`, {
        params: {
          couponId: couponToDelete?.couponId,
        },
      })
      .then(res => {
        setCoupons(prev =>
          prev.filter(coupon => coupon?.couponId !== couponToDelete?.couponId)
        );
        toast.success("Coupon deleted successfully!");
        setActionLoading(false);
        setIsDeleteModalOpen(false);
        setCouponToDelete(null);
        setIsDeleteDialogOpen(false);
      })
      .catch(err => {
        toast.dismiss();
        toast.error("Failed to delete coupon.");
        setActionLoading(false);
        setIsDeleteModalOpen(false);
        setCouponToDelete(null);
      });
  };

  // Handle edit coupon
  const handleEdit = async (updatedCoupon: Coupon) => {
    setActionLoading(true);
    axiosAuthInstance()
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupon/`, updatedCoupon)
      .then(response => {
        setCoupons(prev =>
          prev.map(coupon =>
            coupon.couponId === updatedCoupon.couponId ? response.data : coupon
          )
        );
        toast.success("Coupon updated successfully!");
        setIsDialogOpen(false);
        setIsUpdated(prev => !prev);
        setEditingCoupon(null);
        setActionLoading(false);
        setEditingCouponId(null);
      })
      .catch(err => {
        toast.dismiss();
        toast.error("Failed to update coupon.");
        setActionLoading(false);
      });
  };

  // if (loading) return <p>Loading coupons...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="coupon-list-container w-full pb-16">
      <h1 className="text-2xl font-bold">Coupons</h1>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingContent key={index} className="h-56 flex-1" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon, index) => (
            <div key={index} className=" ">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{coupon?.code}</CardTitle>
                  <CardDescription>{coupon?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-500">
                    Discount: {}{" "}
                    {coupon?.discountType == "PERCENTAGE"
                      ? `${coupon?.discountAmount}%`
                      : `Rs.${coupon?.discountAmount}`}
                  </p>
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Dialog
                    open={editingCouponId === coupon.couponId}
                    onOpenChange={isOpen =>
                      setEditingCouponId(isOpen ? coupon.couponId : null)
                    }
                  >
                    {/* className="text-blue-600"
                    onClick={() => setEditingCoupon(coupon)}
                    disabled={actionLoading}
                    > */}
                    <DialogTrigger
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <MdEdit size={20} />
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-[90%] sm:max-w-[70%] scrollbar-thin overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit</DialogTitle>
                      </DialogHeader>
                      <CouponEditForm
                        coupon={coupon}
                        onSave={handleEdit}
                        onCancel={() => setEditingCouponId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={deletingCouponId === coupon.couponId}
                    onOpenChange={isOpen =>
                      setDeletingCouponId(isOpen ? coupon.couponId : null)
                    }
                  >
                    <DialogTrigger
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "text-red-600 hover:text-red-600"
                      )}
                      onClick={() => {
                        setCouponToDelete(coupon);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <RiDeleteBinLine size={20} />
                    </DialogTrigger>
                    <DialogContent className="max-w-96">
                      <DialogHeader>
                        <DialogTitle>Delete</DialogTitle>
                      </DialogHeader>
                      <div className="modal-content  ">
                        <p className="">
                          Are you sure you want to delete this coupon?
                        </p>
                        <div className="flex space-x-4 mt-4  ">
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded ml-auto"
                            onClick={handleDelete}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
              {/* <div>
                  <p className="font-semibold">{coupon?.code}</p>
                  <p>{coupon?.description}</p>
                  <p className="text-sm text-gray-600">
                    Discount: {}{" "}
                    {coupon?.discountType == "PERCENTAGE"
                      ? `${coupon?.discountAmount}%`
                      : `$${coupon?.discountAmount}`}
                  </p>
                </div> */}
              {/* <div className="flex space-x-2">
                  <Dialog
                    open={editingCouponId === coupon.couponId}
                    onOpenChange={(isOpen) =>
                      setEditingCouponId(isOpen ? coupon.couponId : null)
                    }
                  >
                    
                    <DialogTrigger
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <MdEdit size={20} />
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-[90%] sm:max-w-[70%] scrollbar-thin overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit</DialogTitle>
                      </DialogHeader>
                      <CouponEditForm
                        coupon={coupon}
                        onSave={handleEdit}
                        onCancel={() => setEditingCouponId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={deletingCouponId === coupon.couponId}
                    onOpenChange={(isOpen) =>
                      setDeletingCouponId(isOpen ? coupon.couponId : null)
                    }
                  >
                    <DialogTrigger
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "text-red-600 hover:text-red-600"
                      )}
                      onClick={() => {
                        setCouponToDelete(coupon);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <RiDeleteBinLine size={20} />
                    </DialogTrigger>
                    <DialogContent className="max-w-96">
                      <DialogHeader>
                        <DialogTitle>Delete</DialogTitle>
                      </DialogHeader>
                      <div className="modal-content  ">
                        <p className="">
                          Are you sure you want to delete this coupon?
                        </p>
                        <div className="flex space-x-4 mt-4  ">
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded ml-auto"
                            onClick={handleDelete}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                </div> */}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* {isDeleteModalOpen && (
        <div
          className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this coupon?</p>
            <div className="flex space-x-4 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

// Coupon Edit Form Component
const CouponEditForm: React.FC<{
  coupon: Coupon;
  onSave: (updatedCoupon: Coupon) => void;
  onCancel: () => void;
}> = ({ coupon, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code,
    description: coupon?.description,
    discountAmount: coupon?.discountAmount,
    validFrom: coupon?.validFrom,
    validUntil: coupon?.validUntil,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for date inputs
  const handleDateChange = (
    field: "validFrom" | "validUntil",
    date: Date | null
  ) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString(), // Convert to ISO string or desired format
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...coupon, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-2">
        <Label>Coupon Code</Label>
        <input
          type="text"
          name="code"
          value={formData?.code}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
          placeholder="Code"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Description</Label>
        <input
          type="text"
          name="description"
          value={formData?.description}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
          placeholder="Description"
          required
        />
      </div>
      <div className="flex flex-col gap-3">
        <Label>Discount %</Label>
        <input
          type="number"
          name="discountAmount"
          value={formData?.discountAmount}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
          placeholder="Discount Amount"
          required
        />
      </div>
      <div className="grid md:grid-cols-2 gap-2 mt-2">
        <div>
          <Label className=" font-medium">Start Date</Label>

          <Calendar
            // disabled={isSubmitting}
            mode="single"
            selected={new Date(formData?.validFrom)}
            onSelect={date => {
              if (date) {
                handleDateChange("validFrom", date);
              }
            }}
            initialFocus
          />
        </div>

        <div>
          <Label className=" font-medium">End Date</Label>

          <Calendar
            mode="single"
            selected={new Date(formData?.validUntil)}
            onSelect={date => {
              if (date) {
                handleDateChange("validUntil", date);
              }
            }}
          />
        </div>
      </div>
      <div className="flex mt-2">
        <Button
          type="submit"
          className=" w-full"
          // className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default CouponList;
