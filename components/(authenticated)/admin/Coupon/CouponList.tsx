"use client";

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
import { MdEdit } from "react-icons/md";
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

interface Coupon {
  code: string;
  couponId: string;
  createdAt: string | null;
  description: string;
  discountAmount: number;
  discountType: "FIXED" | "PERCENTAGE";
  isActive: boolean;
  maxDiscountAmount: number;
  minimumOrderAmount: number;
  updatedAt: Date;
  validFrom: Date;
  validUntil: Date;
}

const CouponList = ({
  setIsUpdated,
  isUpdated,
}: {
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
  isUpdated: boolean;
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupon/`)
      .then(res => setCoupons(res.data))
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setIsLoading(false));
  }, [isUpdated]);

  const handleDelete = async () => {
    if (!couponToDelete) return;
    setActionLoading(true);
    axiosAuthInstance()
      .delete(`/api/coupon/`, { params: { couponId: couponToDelete.couponId } })
      .then(() => {
        setCoupons(prev =>
          prev.filter(c => c.couponId !== couponToDelete.couponId)
        );
        toast.success("Coupon deleted");
      })
      .catch(() => toast.error("Delete failed"))
      .finally(() => {
        setActionLoading(false);
        setDeletingCouponId(null);
      });
  };

  return (
    <div className="w-full pb-16">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Coupons
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Manage discount coupons for your store
      </p>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {[...Array(4)].map((_, i) => (
            <LoadingContent key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {coupons.map(coupon => (
            <Card
              key={coupon.couponId}
              className="border border-gray-200 rounded-2xl bg-white transition hover:border-gray-300"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-wide">
                      {coupon.code}
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-500">
                      {coupon.description}
                    </CardDescription>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountAmount}% OFF`
                      : `Rs. ${coupon.discountAmount} OFF`}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Valid:</span>{" "}
                  {new Date(coupon.validFrom).toLocaleDateString()} –{" "}
                  {new Date(coupon.validUntil).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Minimum Order:</span> Rs.{" "}
                  {coupon.minimumOrderAmount}
                </p>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 pt-4">
                {/* EDIT */}
                <Dialog
                  open={editingCouponId === coupon.couponId}
                  onOpenChange={o =>
                    setEditingCouponId(o ? coupon.couponId : null)
                  }
                >
                  <DialogTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-full"
                    )}
                  >
                    <MdEdit size={18} />
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Coupon</DialogTitle>
                    </DialogHeader>
                    <CouponEditForm
                      coupon={coupon}
                      onSave={() => {
                        setIsUpdated(p => !p);
                        setEditingCouponId(null);
                      }}
                      onCancel={() => setEditingCouponId(null)}
                    />
                  </DialogContent>
                </Dialog>

                {/* DELETE */}
                <Dialog
                  open={deletingCouponId === coupon.couponId}
                  onOpenChange={o =>
                    setDeletingCouponId(o ? coupon.couponId : null)
                  }
                >
                  <DialogTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-full text-red-600"
                    )}
                    onClick={() => setCouponToDelete(coupon)}
                  >
                    <RiDeleteBinLine size={18} />
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-xl">
                    <DialogHeader>
                      <DialogTitle>Delete Coupon</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setDeletingCouponId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= EDIT FORM ================= */

const CouponEditForm = ({
  coupon,
  onSave,
  onCancel,
}: {
  coupon: Coupon;
  onSave: (updated: Coupon) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    code: coupon.code,
    description: coupon.description,
    discountAmount: coupon.discountAmount,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({ ...coupon, ...formData });
      }}
      className="space-y-5"
    >
      <div>
        <Label>Coupon Code</Label>
        <input
          className="w-full border rounded-lg px-3 py-2 mt-1"
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
        />
      </div>

      <div>
        <Label>Description</Label>
        <input
          className="w-full border rounded-lg px-3 py-2 mt-1"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Discount (%)</Label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 mt-1"
          value={formData.discountAmount}
          onChange={e =>
            setFormData({
              ...formData,
              discountAmount: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Calendar
            mode="single"
            selected={new Date(formData.validFrom)}
            onSelect={d =>
              d && setFormData({ ...formData, validFrom: d })
            }
          />
        </div>

        <div>
          <Label>End Date</Label>
          <Calendar
            mode="single"
            selected={new Date(formData.validUntil)}
            onSelect={d =>
              d && setFormData({ ...formData, validUntil: d })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default CouponList;
