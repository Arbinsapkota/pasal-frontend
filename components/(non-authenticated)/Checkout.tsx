"use client";
import { cn } from "@/lib/utils";
import { clearCart } from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { axiosAuthInstance, axiosInstance } from "../axiosInstance";
import { getUserFromCookies } from "../cookie/cookie";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "../env";
import { Button, buttonVariants } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface ShippingDetails {
  shippingId: string;
  users: any | null;
  address: string;
  addressType: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Coupon {
  couponId: string;
  code: string;
  discountAmount: number;
  validFrom: string;
  validUntil: string;
  minimumOrderAmount: number;
  maxDiscountAmount: number;
  isActive: boolean;
  discountType: "PERCENTAGE" | "FIXED";
  description: string;
  createdAt: string | null;
  updatedAt: string;
}

export interface DeliveryOptionDetails {
  optionId: string;
  option: "STANDARD" | "EXPRESS" | "NEXT_DAY" | "SAME_DAY" | string;
  description: string;
  charge: number;
  createdAt: string | null;
  updated: string | null;
  deliveryDays: number | null;
}

interface CheckoutItem {
  discountPercentage: number;
  discountPrice: number;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

const Checkout: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = useSelector((state: RootState) => state.cart.items);
  const [loading, setLoading] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const user = getUserFromCookies();

  const [couponData, setCouponData] = useState<Coupon | undefined>();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
    discountCode: "",
    deliveryMethod: "standard",
    deliveryLocation: "kadaghari",
  });
  const [shippingInfo, setShippingInfo] = useState<ShippingDetails[]>();
  const [getLoadingShipping, setGetLoaidngShipping] = useState<boolean>(true);
  const [updateShippingInfo, setUpdateShippingInfo] = useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_ON_DELIVERY" | "KHALTI" | "ESEWA"
  >("CASH_ON_DELIVERY");
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOptionDetails[]>(
    []
  );
  const [selectedDelivery, setSelectedDelivery] = useState<
    string | undefined
  >();
  const [shippingInforDialog, setIsShippingDialogOpen] =
    useState<boolean>(false);
  // Parse items from URL query parameter (for Buy Now)
  useEffect(() => {
    const itemsFromQuery = searchParams.get("items");
    if (itemsFromQuery) {
      try {
        const parsedItems = JSON.parse(
          decodeURIComponent(itemsFromQuery)
        ) as CheckoutItem[];
        setCheckoutItems(parsedItems);
        console.log("Parsed items from URL:", parsedItems);
      } catch (error) {
        console.error("Error parsing items from URL:", error);
        toast.error("Invalid checkout data");
        router.push("/homepage");
      }
    } else {
      // Use cart items if no query parameter is present
      setCheckoutItems(
        items.map(item => ({
          discountPrice: item.discountPrice,
          discountPercentage: item.discountPercentage,
          productId: item.productId,
          name: item.names,
          quantity: item.quantities,
          price: item.prices,
          imageUrl:
            Array.isArray(item.imageUrls) && item.imageUrls.length > 0
              ? item.imageUrls[0]
              : typeof item.imageUrls === "string" && item.imageUrls[0]
              ? item.imageUrls
              : "/product.png",
        }))
      );
    }
  }, [searchParams, items, router]);

  // Fetch delivery options and shipping info
  useEffect(() => {
    axiosAuthInstance()
      .get("/api/shipping/info/by-user")
      .then(res => {
        setShippingInfo(res.data);
        const shippingDet: ShippingDetails[] = res.data;
        setSelectedAddressId(shippingDet?.[0]?.shippingId);
      })
      .catch(err => console.error("Error fetching shipping data", err))
      .finally(() => {
        setGetLoaidngShipping(false);
      });

    axiosAuthInstance()
      .get("/api/delivery/")
      .then(res => {
        setDeliveryOption(res.data);
        setSelectedDelivery(res?.data[0]?.optionId);
      })
      .catch(err => console.error("Error fetching delivery Options", err));
  }, [updateShippingInfo]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Calculate discount
  useEffect(() => {
    if (couponData?.discountAmount && couponData?.discountType) {
      let discountValue;
      if (couponData.discountType === "PERCENTAGE") {
        const total = checkoutItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        discountValue = total * (couponData.discountAmount / 100);
      } else {
        discountValue = couponData.discountAmount;
      }
      setDiscountValue(discountValue);
    }
  }, [couponData, checkoutItems]);

  // Clear cart
  function clearCartItems() {
    dispatch(clearCart());
    if (user) {
      axiosAuthInstance()
        .post("/api/cart/clear")
        .then(() => {})
        .catch(err => console.error("Error clearing cart", err));
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedAddressId && user) {
      toast.dismiss();
      return toast.error("Please select a shipping address or add a new one.");
    }

    let orderData;
    if (user) {
      orderData = {
        orderItems: checkoutItems.map(item => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
        deliveryOption: deliveryOption.find(
          item => item.optionId === selectedDelivery
        )?.option,
        coupon: couponCode.length > 0 ? couponCode : null,
        shippingInfo: selectedAddressId,
      };
    } else {
      orderData = {
        orders: {
          orderItems: checkoutItems.map(item => ({
            product: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod: paymentMethod,
          deliveryOption: deliveryOption.find(
            item => item.optionId === selectedDelivery
          )?.option,
          coupon: couponCode,
        },
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          addressType: "ALTERNATIVE",
        },
      };
    }

    try {
      setIsSubmitting(true);
      if (user) {
        axiosAuthInstance()
          .post(`/api/order/`, orderData)
          .then(res => {
            if (paymentMethod === "ESEWA") {
              toast.success(
                "Order placed. Please complete payment to confirm."
              );
              clearCartItems();
              const paymentHtml = res?.data;
              const newWindow = window.open("", "_blank");
              if (!newWindow) {
                toast.error(
                  "Popup blocked! Please allow popups for this site."
                );
                return;
              }

              if (
                typeof paymentHtml === "string" &&
                paymentHtml.includes("<form")
              ) {
                const htmlWithAutoSubmit = paymentHtml.replace(
                  /<\/form>/i,
                  `</form><script>window.onload = function() { document.forms[0].submit(); }<\/script>`
                );
                newWindow.document.open();
                newWindow.document.write(htmlWithAutoSubmit);
                newWindow.document.close();
              } else {
                toast.error("Invalid eSewa payment form.");
              }
            } else if (paymentMethod === "KHALTI") {
              router.push(res?.data);
              toast.success(
                "Order placed. Please complete payment to confirm."
              );
              clearCartItems();
            } else {
              toast.success("Order placed Successfully!");
              clearCartItems();
              router.back();
              // window.location.reload();
            }
            setIsSubmitting(false);
          })
          .catch(err => {
            toast.dismiss();
            toast.error("Error occurred while placing order:");
            console.error("Error occurred while placing order:", err);
            setIsSubmitting(false);
          });
      }
    } catch (error) {
      toast.error("Error occurred while placing order:");
      console.error("Error occurred while placing order:", error);
      setIsSubmitting(false);
    }
  };

  const [addFormData, setAddFormData] = useState({
    address: "",
    city: "",
    state: "",
    addressType: "ALTERNATIVE",
    phoneNumber: "",
    shippingId: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddOrEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing && addFormData.shippingId) {
      // Editing existing address
      axiosAuthInstance()
        .post(`/api/shipping/info/`, addFormData)
        .then(() => {
          // window.location.reload();
          setIsShippingDialogOpen(false);
          setUpdateShippingInfo(prev => !prev);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error updating Address", err);
          toast.error("Something went wrong.");
          setLoading(false);
        });
    } else {
      // Adding new address
      axiosAuthInstance()
        .post("/api/shipping/info/", addFormData)
        .then(() => {
          // window.location.reload();
          setLoading(false);
          setIsShippingDialogOpen(false);
          setUpdateShippingInfo(prev => !prev);
        })
        .catch(err => {
          console.error("Error adding Address", err);
          toast.error("Something went wrong.");
          setLoading(false);
        });
    }
  };

  const handleEditShipping = (info: any) => {
    setAddFormData(info);
    setIsEditing(true);
    setIsShippingDialogOpen(true);
  };

  const submitCoupon = () => {
    axiosInstance()
      .get("/api/coupon/code", {
        params: {
          code: couponCode,
        },
      })
      .then(res => {
        const coupon = res.data;
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);

        if (now >= validFrom && now <= validUntil) {
          setIsOpen(false);
          setCouponData(coupon);
          toast.success("Promocode Available");
        } else {
          toast.error("Promocode is not valid at this time");
          setCouponCode("");
        }
      })
      .catch(err => {
        console.error("Error getting coupons", err);
        setCouponCode("");
        toast.error("Promocode not available");
      });
  };

  useEffect(() => {
    if (checkoutItems.length === 0) {
      const timer = setTimeout(() => {
        router.push("/homepage");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [checkoutItems, router]);

  const deliveryCharge =
    deliveryOption.find(item => item.optionId === selectedDelivery)?.charge ||
    0;

  return (
    <div className=" w-full sm:px-8 px-4 mx-auto sm:p-6 pt-20 bg-gray-100">
      <div className="pb-4 pt-4 sm:mt-16">
        <div className="flex gap-4 items-center font-medium">
          <Link
            href={"/homepage"}
            className=" hover:text-primaryBlue hover:underline"
          >
            Home
          </Link>{" "}
          <FaChevronRight className="shrink-0" />{" "}
          <p className="text-gray-500 truncate">Checkout</p>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!user && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Billing And Contact Information
            </h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Postal Code"
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                className="p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>
        )}
        {user && (
          <div className="border rounded-md px-4 py-4  sm:space-y-6 space-y-4">
            <div className="bg-white  px-4 py-2 rounded-md border">
              <div className="flex  items-center justify-between w-full ">
                <p className="font-semibold text-xl">Address</p>
                <Dialog
                  onOpenChange={setIsShippingDialogOpen}
                  open={shippingInforDialog}
                >
                  <DialogTrigger
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    <IoIosAdd size={20} />
                    Add Address
                  </DialogTrigger>
                  <VisuallyHidden>
                    <DialogTitle>Address</DialogTitle>
                  </VisuallyHidden>
                  <DialogContent className="w-full max-w-xl">
                    <form onSubmit={handleAddOrEdit}>
                      <div className="mb-4">
                        <label
                          htmlFor="addressType"
                          className="block text-sm font-medium"
                        >
                          Address Type
                        </label>
                        <select
                          disabled={loading}
                          id="addressType"
                          name="addressType"
                          value={addFormData?.addressType}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          {/* <option value="PRIMARY">Primary</option> */}
                          <option value="ALTERNATIVE">Alternative</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium"
                        >
                          Address
                        </label>
                        <input
                          disabled={loading}
                          type="text"
                          id="address"
                          name="address"
                          value={addFormData.address}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium"
                        >
                          City
                        </label>
                        <input
                          disabled={loading}
                          type="text"
                          id="city"
                          name="city"
                          value={addFormData.city}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm">State</label>
                        <select
                          name="state"
                          value={addFormData.state}
                          onChange={handleChange}
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

                      <div className="mb-4">
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-medium"
                        >
                          Phone Number
                        </label>
                        <input
                          disabled={loading}
                          type="text"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={addFormData.phoneNumber}
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
                          {loading
                            ? "Submitting..."
                            : isEditing
                            ? "Update"
                            : "Submit"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                {getLoadingShipping ? (
                  <div className="flex gap-2 items-start p-4 border border-gray-300 rounded-lg">
                    <div className="mt-2 h-4 w-4 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="flex flex-col w-full gap-2">
                      <div className="h-5 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 w-1/4 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 w-1/3 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-300 rounded-md animate-pulse"></div>
                  </div>
                ) : shippingInfo?.length === 0 ? (
                  <div className="flex gap-2 items-center justify-center p-4 border border-gray-300 rounded-lg">
                    {" "}
                    <p className="text-center text-gray-600">
                      Add shipping address.
                    </p>{" "}
                  </div>
                ) : (
                  shippingInfo?.map((address, index) => {
                    const id = `address-${index}`;
                    return (
                      <div
                        key={index}
                        className="flex gap-2 items-start p-4 border border-gray-300 rounded-lg hover:bg-muted"
                      >
                        <input
                          type="radio"
                          id={id}
                          name="address"
                          value={address?.shippingId}
                          checked={selectedAddressId === address?.shippingId}
                          onChange={e => setSelectedAddressId(e.target.value)}
                          className="mt-2"
                        />
                        <Label
                          htmlFor={id}
                          className="flex flex-col cursor-pointer w-full"
                        >
                          <span className="font-semibold text-lg">
                            {address?.address}
                          </span>
                          <span className="text-sm">
                            {address?.addressType}
                          </span>
                          <span className="text-sm">
                            {address?.phoneNumber}
                          </span>
                          <span className="text-sm">{address?.postalCode}</span>
                        </Label>
                        {/* EDIT BUTTON */}
                        <Button
                          variant="outline"
                          className="px-4 py-2 text-sm font-semibold shadow-sm hover:scale-105 transition-transform duration-200"
                          onClick={() => handleEditShipping(address)}
                        >
                          Edit
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white py-3 px-4 rounded-md border">
              <p className="font-semibold text-xl">Delivery Options</p>
              <Select
                value={selectedDelivery}
                onValueChange={value => setSelectedDelivery(value)}
              >
                <SelectTrigger className="w-[200px] mt-4">
                  <SelectValue placeholder="Select Options" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryOption.map((item, index) => (
                    <SelectItem key={index} value={item?.optionId}>
                      {item?.option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-white py-2 px-4 border rounded-md">
              <h2 className="font-semibold text-xl">Payment Method</h2>
              <div className="flex sm:flex-row flex-row gap-4 mt-4">
                <label
                  htmlFor="CASH_ON_DELIVERY"
                  className={`cursor-pointer border p-2 rounded-md sm:flex sm:items-center sm:justify-center ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    id="CASH_ON_DELIVERY"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    className="hidden"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  />
                  <Image
                    src="/cod.png"
                    alt="Cash on Delivery"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-md border shadow-sm">
  <h2 className="text-xl font-semibold mb-3">Order Summary </h2>
  {checkoutItems.length === 0 ? (
    <p>No items in the checkout.</p>
  ) : (
    <div className="grid lg:grid-cols-2 max-h-[16rem] overflow-y-auto scrollbar-thin gap-2">
      {checkoutItems.map(item => (
        <div key={item.productId} className="flex items-center mb-4">
          <Image
            src={`${NEXT_PUBLIC_CLOUDINARY_URL}${item.imageUrl}`}
            alt={item.name || "pic"}
            width={200}
            height={200}
            style={{ objectFit: "cover" }}
            className="rounded h-20 w-20"
          />
          <div className="ml-4">
            <p className="font-medium text-wrap">{item.name}</p>
            <p>Quantity: {item.quantity}</p>
            <p className="sm:text-sm text-xs text-gray-500 text-red-500">
              Discount: Rs.
              {(
                item.discountPercentage
                  ? (item.price * item.discountPercentage) / 100 * item.quantity
                  : item.discountPrice * item.quantity
              ).toFixed(2)}
            </p>
            <div>
              <p className="text-primaryBlue sm:text-lg text-sm font-semibold">
                Rs.
                {(
                  (item.price - (item.discountPercentage
                    ? (item.price * item.discountPercentage) / 100
                    : item.discountPrice)) * item.quantity
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  <div>
    <div>
      <p className="text-primaryBlue font-semibold">Coupon Code</p>
    </div>
    <div className="flex gap-2 items-center">
      <input
        type="text"
        name="discountCode"
        value={couponCode}
        onChange={e => setCouponCode(e.target.value)}
        placeholder="Discount Code (optional)"
        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primaryBlue"
      />
      <Button onClick={submitCoupon}>Apply</Button>
    </div>
  </div>

  <p className="text-lg mt-1">
    Subtotal: Rs.
    {checkoutItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2)}
  </p>
  <p className="text-lg mt-1 font-semibold text-red-500">
    Coupon Discount: Rs. {discountValue.toFixed(2)}
  </p>

  {selectedDelivery && (
    <p className="text-green-600">
      Delivery Charge: Rs.
      {
        deliveryOption.find(item => item.optionId === selectedDelivery)
          ?.charge
      }
    </p>
  )}
  {selectedDelivery && (
    <p>
      Description:{" "}
      <span>
        {
          deliveryOption.find(
            item => item.optionId === selectedDelivery
          )?.description
        }
      </span>
    </p>
  )}
  {selectedDelivery && (
    <p>
      Delivery Duration:{" "}
      <span>
        {
          deliveryOption.find(
            item => item.optionId === selectedDelivery
          )?.deliveryDays
        }
        {deliveryOption.find(item => item.optionId === selectedDelivery)
          ?.deliveryDays === 1
          ? " day"
          : " days"}
      </span>
    </p>
  )}

  <p className="w-full border-b-2 mt-2 border-gray-300"></p>
  <p className="font-bold text-lg mt-2">
    Total: Rs.
    {(
      checkoutItems.reduce((sum, item) => {
        const discountAmount = item.discountPercentage
          ? (item.price * item.discountPercentage) / 100
          : item.discountPrice;
        return sum + (item.price - discountAmount) * item.quantity;
      }, 0) + (selectedDelivery
        ? deliveryOption.find(item => item.optionId === selectedDelivery)?.charge || 0
        : 0) - discountValue
    ).toFixed(2)}
  </p>

  <Button
    type="submit"
    disabled={isSubmitting}
    onClick={handleSubmit}
    className="mt-2 w-full"
  >
    {isSubmitting ? "Submitting..." : "Place Order"}
  </Button>
</div>


        <div></div>
      </div>
    </div>
  );
};

export default Checkout;
