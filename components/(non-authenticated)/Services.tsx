"use client";

import React from "react";
import { FaShippingFast, FaTags } from "react-icons/fa";
import { MdOutlineSupportAgent } from "react-icons/md";
import { RiSecurePaymentFill } from "react-icons/ri";
import { Card } from "../ui/card";

const IconBox = ({ children }: { children: React.ReactElement }) => (
  <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-white shadow-sm border border-indigo-200/40">
    {React.cloneElement(children, { className: "text-indigo-600 text-2xl" })}
  </div>
);

const services = [
  {
    icon: <FaShippingFast />,
    title: "Fast Delivery",
    desc: "Quick and reliable nationwide delivery.",
  },
  {
    icon: <MdOutlineSupportAgent />,
    title: "24/7 Support",
    desc: "Always here to assist you anytime.",
  },
  {
    icon: <FaTags />,
    title: "Special Offers",
    desc: "Exclusive discounts and limited-time deals.",
  },
  {
    icon: <RiSecurePaymentFill />,
    title: "Secure Payment",
    desc: "Safe, easy, and flexible payment options.",
  },
];

const Services = () => {
  return (
    <section className="py-14 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-semibold tracking-wider text-indigo-600">
            Our Services
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
            Shopping Made Simple
          </p>
          <p className="text-gray-600 mt-2 text-base max-w-xl mx-auto">
            Premium services designed for comfort, speed, and trust.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {services.map((item, index) => (
            <Card
              key={index}
              className="
                p-5 md:p-6 rounded-2xl 
                bg-white/70 backdrop-blur 
                border border-gray-100 shadow-sm 
                hover:shadow-md hover:border-indigo-200/70 
                transition-all duration-300 cursor-pointer
                flex flex-col items-center text-center
              "
            >
              <IconBox>{item.icon}</IconBox>

              <h3 className="text-lg font-semibold text-gray-900 mt-3">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
