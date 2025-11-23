// Updated TestimonialCards component with image fallback to prevent null/undefined path errors

"use client";

import React from "react";
import Image from "next/image";

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
    <section className="py-16 bg-white">
      {/* Title */}
      <h2 className="text-center text-3xl font-bold text-orange-500 mb-2">
        TESTIMONIALS
      </h2>
      <p className="text-center text-gray-600 mb-12">
        Subscribe Easy Tutorials YouTube channel to watch more videos.
      </p>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.testimonialId}
            className="bg-white shadow-lg rounded-xl p-8 text-center relative border border-gray-200"
          >
            {/* Avatar with fallback */}
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-md -mt-16">
              <Image
                src={testimonial.image || "/default-profile.png"}
                alt={testimonial.name}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            {/* Quote */}
            <p className="text-gray-700 text-sm leading-relaxed mt-6">
              <span className="text-orange-500 text-2xl font-bold">❝ </span>
              {testimonial.description}
              <span className="text-orange-500 text-2xl font-bold"> ❞</span>
            </p>

            {/* Name */}
            <h3 className="mt-6 font-semibold text-gray-900 text-lg">
              {testimonial.name}
            </h3>
            <p className="text-sm text-orange-500 font-medium">
              {testimonial.position}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
export { TestimonialCards };