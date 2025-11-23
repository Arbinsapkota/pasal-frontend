import React from "react";
import { FaShippingFast } from "react-icons/fa";
import { CiDiscount1 } from "react-icons/ci";
import { MdOutlineSupportAgent } from "react-icons/md";
import { Card } from "../ui/card";

const services = [
  {
    icon: <FaShippingFast className="text-white text-2xl" />,
    title: "Fast Delivery",
    description:
      "Get your orders delivered quickly and reliably across Nepal with our express shipping service.",
    button: "Shop Now",
  },
  {
    icon: <MdOutlineSupportAgent className="text-white text-2xl" />,
    title: "24/7 Online Support",
    description:
      "We are here to help you any time of the day with real-time support from our friendly team.",
    button: "Contact Us",
  },
  {
    icon: <CiDiscount1 className="text-white text-2xl" />,
    title: "Special Offers",
    description:
      "Check out our exclusive deals and discounts available for a limited time.",
    button: "View Offers",
  },
  {
    icon: <CiDiscount1 className="text-white text-2xl" />,
    title: "Flexible Payment",
    description:
      "Multiple payment options for your convenience and security.",
    button: "View Offers",
  },
];

const Services = () => {
  return (
    <section className="py-10 px-4 md:px-12 bg-gray-50">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          Our <span className="text-green-600">Services</span>
        </h2>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          What we offer to make your shopping experience amazing
        </p>
      </div>

      {/* Desktop/Tablet Grid */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        {services.map((service, index) => (
          <Card
            key={index}
            className="p-4 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition duration-300 bg-white flex flex-col items-center text-center gap-4"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-md mb-2">
              {service.icon}
            </div>
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
            <button className="mt-2 px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">
              {service.button}
            </button>
          </Card>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden flex gap-4 overflow-x-auto py-2">
        {services.map((service, index) => (
          <Card
            key={index}
            className="min-w-[220px] p-4 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition duration-300 bg-white flex-shrink-0 flex flex-col items-center text-center gap-4"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-md mb-2">
              {service.icon}
            </div>
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
            <button className="mt-2 px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition">
              {service.button}
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Services;
