// app/not-found.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:h-auto min-h-screen items-center justify-center text-center">
      <Image src={"/not-found.gif"} width={400} height={400} alt="not found" />
      <h1 className="text-4xl font-bold mb-4 text-red-500">
        Oops! Page Not Found
      </h1>
      <p className="mb-6">
        Sorry, the page you&apos;re looking for doesn&apos;t exist.
      </p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Back
      </button>
    </div>
  );
}
