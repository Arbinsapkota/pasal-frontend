import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import { useEffect, useState } from "react";
import UploadDeliveryOptions from "./UploadDeliveryOptions";
import DeliveryOptionSkeleton from "@/components/loaidng/DeliverySkeleton";
import { Truck } from "lucide-react";

// Define a type for the delivery option
interface DeliveryOption {
  optionId: string;
  option: string;
  description: string;
  charge: number;
  createdAt: string | null;
  updatedAt: string | null;
  deliveryDays?: number;
}

function DeliveryOptions() {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isUpdated, setIsUpdated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDeliveryOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/`
      );
      if (response.status === 200) {
        setDeliveryOptions(response.data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching delivery options:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOptions();
  }, [isUpdated]);

  const handleDelete = async (optionId: string) => {
    axios
      .delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/?optionId=${optionId}`,
        {
          headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
          },
        }
      )
      .then(() => {
        setDeliveryOptions(prev =>
          prev.filter(option => option.optionId !== optionId)
        );
        setIsUpdated(prev => !prev);
      })
      .catch(err => {
        console.error("Error deleting delivery option:", err);
      });
  };

  return (
    <div className="w-full">
      <UploadDeliveryOptions
        fetchDeliveryOptions={fetchDeliveryOptions}
        setIsUpdated={setIsUpdated}
      />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          Delivery Options
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure delivery methods, charges, and timelines
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <DeliveryOptionSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliveryOptions.length > 0 ? (
            deliveryOptions.map(option => (
              <div
                key={option.optionId}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300"
              >
                {/* Top */}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {option.option}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border">
                    {option.deliveryDays} Days
                  </span>
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Bottom */}
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                    Rs. {option.charge}
                  </p>

                  <button
                    onClick={() => handleDelete(option.optionId)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No delivery options available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryOptions;
