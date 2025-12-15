"use client";

import React from "react";
import Image from "next/image";

const QuoteIcon = () => (
  <svg
    className="w-6 h-6 text-amber-500 mx-auto opacity-80"
    fill="currentColor"
    viewBox="0 0 24 24"
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
        "सेवा उत्कृष्ट! छिटो डेलिभरी र सुरक्षित प्याकेजिङ। अत्यन्त सन्तुष्ट छु।",
    },
    {
      testimonialId: "2",
      name: "Sita Gurung",
      position: "Customer",
      image: "/testimonials/sita.jpg",
      description:
        "उत्तम ग्राहक सेवा, छान्न सजिलो प्रोडक्ट र समयमै डेलिभरी – एकदम सिफारिस गर्छु!",
    },
    {
      testimonialId: "3",
      name: "Ramesh Thapa",
      position: "Entrepreneur",
      image: "/testimonials/ramesh.jpg",
      description:
        "प्रयोगमैत्री वेबसाइट, छिटो checkout र हरेक चीज व्यवस्थित। शानदार अनुभव!",
    },
  ];

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* HEADER */}
        <h2 className="text-center text-xs tracking-widest font-semibold uppercase text-amber-500">
          CUSTOMER STORIES
        </h2>

        <p className="text-center text-3xl font-bold text-gray-900 mt-1 mb-3">
          Trusted By Thousands
        </p>

        <p className="text-center text-base text-gray-600 max-w-xl mx-auto mb-12">
          Hear what our valued customers say about their shopping experience.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.testimonialId}
              className="
                bg-white/90 
                backdrop-blur 
                rounded-2xl 
                px-6 pt-14 pb-6 
                shadow-[0_4px_18px_rgba(0,0,0,0.06)]
                hover:shadow-[0_6px_25px_rgba(0,0,0,0.10)]
                transition-all 
                duration-300 
                relative
              "
            >
              
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-4 ring-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={t.image || "/default-profile.png"}
                  alt={t.name}
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </div>

              {/* Quote Icon */}
              <div className="flex justify-center mt-2">
                <QuoteIcon />
              </div>

              {/* Text */}
              <p className="text-gray-700 text-sm leading-relaxed mt-4 italic">
                {t.description}
              </p>

              <div className="w-10 h-[2px] bg-gray-200 mx-auto my-4" />

              <h3 className="text-gray-900 font-semibold text-lg">
                {t.name}
              </h3>
              <p className="text-amber-600 text-xs font-medium">{t.position}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { TestimonialCards };
