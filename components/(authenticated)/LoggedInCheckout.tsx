"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCheckout } from "../providers/CheckoutProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useShippingInfo } from "@/components/providers/ShippingInfoProvider";
import { getCookie } from "../cookie/cookie";
import Image from "next/image";
import { FaShippingFast, FaCreditCard } from "react-icons/fa"; // Importing icons

type DeliveryOption = {
  optionId: string;
  option: string;
  description: string;
  charge: number;
};

const LoggedInCheckout: React.FC = () => {
  const router = useRouter();
  const { checkoutItems, getTotalPrice } = useCheckout();

  // console.log("checkout items are", checkoutItems);
  const { shippingInfo, loading, error, fetchShippingInfo } = useShippingInfo();

  const [formData, setFormData] = useState({
    discountCode: "",
    deliveryMethod: "",
    shippingId: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "STRIPE" | "CASH_ON_DELIVERY" | undefined
  >();
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  // To handle hydration mismatch due to dynamic content
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchShippingInfo();
    setMounted(true); // Set mounted to true after component is mounted
  }, []);

  // Fetch delivery options
  // useEffect(() => {
  //   const fetchDeliveryOptions = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/`
  //       );
  //       setDeliveryOptions(response.data);
  //     } catch (error) {
  //       console.error("Error fetching delivery options:", error);
  //       toast.error("Failed to load delivery options.");
  //     }
  //   };

  //   fetchDeliveryOptions();
  // }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      toast.dismiss();
      toast.error("Please select a payment method.");
      return;
    }

    const orderData = {
      orderItems: checkoutItems.map(item => ({
        products: { productId: item.productId },
        quantity: item.quantity,
        price: item.discountedPrice,
      })),
      paymentMethod: paymentMethod,
      deliveryOption: formData.deliveryMethod,
      shippingInfo: { shippingId: formData.shippingId },
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.dismiss();
        toast.success("Order placed. Please complete payment to confirm.");
        if (paymentMethod === "STRIPE") {
          // Add stripe payment logic here if needed
        }
        router.push(response.data);
      }
      if (paymentMethod === "CASH_ON_DELIVERY") {
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/homepage`);
      }
    } catch (error) {
      console.error("Error occurred while placing order:", error);
      toast.error("Failed to place order. Try again later.");
    }
  };

  // if (loading) return <p className="text-center text-lg">Loading...</p>;
  // if (error) return <p className="text-center text-red-500">{error}</p>;

  // Only render after the component has mounted
  if (!mounted) return null;

  // console.log(checkoutItems);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Cart Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {checkoutItems.length === 0 ? (
          <p>No items in the checkout.</p>
        ) : (
          checkoutItems.map(item => (
            <div key={item.id} className="flex items-center mb-4">
              <Image
                src={
                  typeof item.imageUrls === "string"
                    ? item?.imageUrls
                    : item?.imageUrls?.[0] || "/product.png"
                }
                alt={item.title || "pic"}
                width={64}
                height={64}
                className="object-cover rounded"
              />
              <div className="ml-4">
                <p className="font-medium">{item.title}</p>
                <p>Quantity: {item.quantity}</p>
                <p>${item.discountedPrice * item.quantity}</p>
              </div>
            </div>
          ))
        )}
        <input
          type="text"
          name="discountCode"
          value={formData.discountCode}
          onChange={handleInputChange}
          placeholder="Discount Code (optional)"
          className="p-2 border border-gray-300 rounded"
        />
        <p className="text-lg font-bold">Total: ${getTotalPrice()}</p>
      </div>

      {/* Checkout Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Shipping Address Dropdown */}
        <div>
          <label htmlFor="shippingId" className="font-medium flex items-center">
            <FaShippingFast className="mr-2" /> Shipping Address
          </label>
          <select
            name="shippingId"
            value={formData.shippingId}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Shipping Address</option>
            {shippingInfo.map(shipping => (
              <option key={shipping.shippingId} value={shipping.shippingId}>
                {shipping.address} - {shipping.city}, {shipping.state},{" "}
                {shipping.country}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Method Dropdown */}
        <div>
          <label className="font-medium flex items-center">
            <FaShippingFast className="mr-2" /> Shipping Fee Estimator
          </label>
          <select
            name="deliveryMethod"
            value={formData.deliveryMethod}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Delivery Method</option>
            {deliveryOptions.length > 0 ? (
              deliveryOptions.map(option => (
                <option key={option.optionId} value={option.option}>
                  {option.option} - ${option.charge}
                </option>
              ))
            ) : (
              <option disabled>Loading delivery methods...</option>
            )}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="font-medium flex items-center">
            <FaCreditCard className="mr-2" /> Payment Method
          </label>
          <div>
            <input
              type="radio"
              id="STRIPE"
              name="paymentMethod"
              value="STRIPE"
              checked={paymentMethod === "STRIPE"}
              onChange={() => setPaymentMethod("STRIPE")}
            />
            <label htmlFor="STRIPE">Stripe</label>
          </div>
          <div>
            <input
              type="radio"
              id="CASH_ON_DELIVERY"
              name="paymentMethod"
              value="CASH_ON_DELIVERY"
              checked={paymentMethod === "CASH_ON_DELIVERY"}
              onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
            />
            <label htmlFor="CASH_ON_DELIVERY">Cash on Delivery</label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="primary-btn text-white py-2 px-4 rounded mt-6"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default LoggedInCheckout;
