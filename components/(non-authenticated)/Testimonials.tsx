"use client";

import React from "react";
import Image from "next/image";
// Using a simple SVG icon for a cleaner quote mark
const QuoteIcon = () => (
  <svg
    className="w-8 h-8 text-amber-500 mx-auto"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13.5 13.5h-3a1.5 1.5 0 010-3h3a1.5 1.5 0 010 3zM13.5 18h-3a1.5 1.5 0 010-3h3a1.5 1.5 0 010 3zM16.5 6a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V6zM16.5 10.5a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0v-1.5z" />
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 21a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z"
      clipRule="evenodd"
    />
  </svg>
);


interface Testimonial {
  testimonialId: string;
  name: string;
  position: string;
  image: string | null;
  description: string;
}

export default function TestimonialCards() {
  const testimonials: Testimonial[] = [
    {
      testimonialId: "1",
      name: "Arbin Sapkota",
      position: "Shop Owner",
      image: "/testimonials/arbin.jpg",
      description:
        "हाम्रो पसलमा सेवा अनुभव अद्भुत छ! डेलिभरी छिटो भयो र सामान पूर्ण रूपमा सुरक्षित अवस्थामा पुग्यो। अत्यन्त सिफारिस गर्छु!",
    },
    {
      testimonialId: "2",
      name: "Sita Gurung",
      position: "Customer",
      image: "/testimonials/sita.jpg",
      description:
        "सामानहरूको विविधता धेरै राम्रो छ र छुटहरू असाध्यै आकर्षक छन्। ग्राहक सेवा पनि धेरै मैत्रीपूर्ण छ!",
    },
    {
      testimonialId: "3",
      name: "Ramesh Thapa",
      position: "Entrepreneur",
      image: "/testimonials/ramesh.jpg",
      description:
        "यहाँ किनमेल गर्नु सधैं रमाइलो हुन्छ। वेबसाइट प्रयोग गर्न सजिलो छ र Checkout प्रक्रिया छिटो र सुरक्षित छ।",
    },
  ];

  return (
    // 1. Softer, slightly off-white background for depth
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Title & Subtitle */}
        <h2 className="text-center text-sm tracking-widest font-semibold uppercase text-amber-500 mb-2">
          CUSTOMER VOICES
        </h2>
        {/* 2. Darker, more serious primary heading */}
        <p className="text-center text-4xl font-extrabold text-gray-900 mb-4">
          What Our Clients Say
        </p>
        <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Hear from the entrepreneurs and customers who trust our platform for quality and service.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.testimonialId}
              // 3. Elevated Card Design: Rounded corners, larger padding, subtle shadow, and a dark border on hover
              className="bg-white rounded-2xl p-10 pt-16 text-center relative transition duration-300 ease-in-out transform hover:shadow-xl shadow-lg border-t-4 border-amber-500/0 hover:border-amber-500"
            >
              
              {/* Avatar with fallback - positioned to slightly overlap the card top */}
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden shadow-xl ring-4 ring-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={testimonial.image || "/default-profile.png"}
                  alt={testimonial.name}
                  width={112} // w-28 = 112px
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Quote Icon */}
              <div className="mt-2 mb-4">
                <QuoteIcon />
              </div>

              {/* Quote */}
              {/* 4. Improved typography for the description */}
              <p className="text-gray-800 text-base italic leading-relaxed">
                {testimonial.description}
              </p>

              {/* Name & Position Divider */}
              <div className="w-12 h-0.5 bg-gray-200 mx-auto my-6"></div>


              {/* Name */}
              <h3 className="font-bold text-xl text-gray-900">
                {testimonial.name}
              </h3>
              {/* 5. Subtler position text with the accent color */}
              <p className="text-sm text-amber-600 font-medium mt-1">
                {testimonial.position}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export { TestimonialCards };