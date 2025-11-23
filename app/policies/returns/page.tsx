import Footer from "@/components/(non-authenticated)/Footer";
import Header from "@/components/(non-authenticated)/Header";
import React from "react";

const Page = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
            Refund Policy
          </h1>
          <p className="text-gray-700 mb-4">
            <strong>Note:</strong> All sales are final!
          </p>
          <p className="text-gray-700">
            Damaged products can be accepted as returns, and we will send a
            replacement product. Proof of the damaged product is required.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;
