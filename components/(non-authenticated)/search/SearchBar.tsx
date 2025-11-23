"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

function SearchBar() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(""); // Manage search input state
  const handleSearch = () => {
    if (searchTerm) {
      router.push(
        `${
          process.env.NEXT_PUBLIC_FRONTEND_URL
        }/homepage/search?query=${encodeURIComponent(searchTerm)}` // Redirect to search page with query params
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Search Input and Button */}
      <div className="flex flex-row items-center ">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search in ETECH"
          className="p-2 border rounded-md w-full sm:max-w-80 lg:max-w-96" // Responsive width
        />
        <button
          onClick={handleSearch}
          className="bg-teal-950 text-white py-2 px-4 rounded-md mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
