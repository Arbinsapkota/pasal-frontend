import { getTokenFromCookies } from "@/components/cookie/cookie";
import axios from "axios";
import { useEffect, useState } from "react";
import UploadDeliveryOptions from "./UploadDeliveryOptions";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
import DeliveryOptionSkeleton from "@/components/loaidng/DeliverySkeleton";

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
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]); // Array of delivery options
  const [isUpdated, setIsUpdated] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Define the fetchDeliveryOptions function
  const fetchDeliveryOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/`
      );

      if (response.status === 200) {
        setDeliveryOptions(response.data); // Set the fetched delivery options
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching delivery options:", err);
      setIsLoading(false);
    }
  };

  // Fetch delivery options when the component mounts
  useEffect(() => {
    fetchDeliveryOptions(); // Fetch the data when the component mounts
  }, [isUpdated]);

  // Function to handle delete action
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
        // Remove the deleted option from state
        setDeliveryOptions(prevOptions =>
          prevOptions.filter(option => option.optionId !== optionId)
        );
        setIsUpdated(prev => !prev);
      })
      .catch(err => {
        console.error("Error deleting delivery option:", err);
      });
  };

  return (
    <div>
      <UploadDeliveryOptions
        fetchDeliveryOptions={fetchDeliveryOptions}
        setIsUpdated={setIsUpdated}
      />
      <h2 className="text-2xl font-semibold text-start mb-4">
        Delivery Options List
      </h2>
      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DeliveryOptionSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryOptions.length > 0 ? (
            deliveryOptions.map(option => (
              <div
                key={option.optionId}
                className="p-4 border border-gray-400  rounded-md animate__animated animate__fadeIn bg-white transform transition-all duration-300 ease-in-out shadow-md shadow-gray-300"
              >
                <h3 className="text-xl text-gray-800  font-semibold">
                  {option.option}
                </h3>
                <p className="text-sm text-gray-600 font-semibold py-1">
                  {" "}
                  Delivery Days: {option?.deliveryDays}
                </p>
                <p className="text-sm text-black">{option.description}</p>
                <p className="text-lg font-semibold text-black">
                  Rs.{option.charge}
                </p>
                <div className="flex flex-row space-x-4 mt-4">
                  <button
                    onClick={() => handleDelete(option.optionId)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No delivery options available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryOptions;
