"use client";

import React from "react";
// Re-using your current react-icons for structure, but you would replace these with custom, colorful SVGs
import { FaShippingFast, FaTags } from "react-icons/fa"; 
import { MdOutlineSupportAgent } from "react-icons/md";
import { RiSecurePaymentFill } from "react-icons/ri"; // Using a different icon for Flexible Payment
// Assuming 'Card' is a styled component like one from ShadCN or similar
import { Card } from "../ui/card"; 

// Placeholder for a high-impact, colorful SVG icon
const ColorfulIconWrapper = ({ children }: { children: React.ReactElement }) => (
  // Use a richer color for the background circle
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 shadow-inner mb-4">
    {/* The actual icon will use the accent color */}
    {React.cloneElement(children, { 
      className: "text-indigo-600 text-3xl", 
    })}
  </div>
);

const services = [
  {
    icon: <FaShippingFast />,
    title: "Nationwide Fast Delivery",
    description:
      "Get your orders delivered quickly and reliably across Nepal with our express, tracked shipping service.",
  },
  {
    icon: <MdOutlineSupportAgent />,
    title: "Premium 24/7 Support",
    description:
      "Real-time support from our dedicated team, ready to assist you any time of the day via chat or call.",
  },
  {
    // Changed CiDiscount1 to FaTags for variety, but both work
    icon: <FaTags />, 
    title: "Exclusive Special Offers",
    description:
      "Unlock access to members-only deals, flash sales, and special discounts available for a limited time.",
  },
  {
    // Changed CiDiscount1 to RiSecurePaymentFill for variety and relevance
    icon: <RiSecurePaymentFill />, 
    title: "Flexible Secure Payment",
    description:
      "Pay with confidence using multiple convenient and fully secured payment options including COD and digital wallets.",
  },
];

const Services = () => {
  return (
    // 1. Softer, neutral background for an upscale feel
    <section className="py-20 px-4 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Title Section: Cleaner Typography */}
        <div className="text-center mb-16">
          <h2 className="text-sm tracking-widest font-semibold uppercase text-indigo-600 mb-2">
            Commitment to Quality
          </h2>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Why Shop With Us
          </p>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Experience the difference with features designed to make your shopping simple, fast, and reliable.
          </p>
        </div>

        {/* 2. Premium 2x2 Grid Layout for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              // 3. Elevated Card Design: Increased padding, sharper shadow, and border integration
              className="p-8 rounded-2xl shadow-xl border-t-4 border-indigo-600/0 hover:border-indigo-600 transform hover:scale-[1.02] transition duration-300 bg-white flex flex-col items-center text-center group"
            >
              
              {/* Icon Section (Using Wrapper for colorful SVG effect) */}
              <ColorfulIconWrapper>{service.icon}</ColorfulIconWrapper>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">
                {service.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed">
                {service.description}
              </p>
              
              {/* NOTE: Call to Action buttons are intentionally removed */}

            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;