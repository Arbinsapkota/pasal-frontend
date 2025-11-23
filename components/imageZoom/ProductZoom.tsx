"use client";

import { useRef, useState } from "react";

export default function ProductZoom() {
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Clamp lens inside the image
    const lensX = Math.max(0, Math.min(x, width));
    const lensY = Math.max(0, Math.min(y, height));

    setLensPosition({ x: lensX, y: lensY });
  };

  return (
    <div className="flex gap-6">
      {/* Left: main image with lens */}
      <div
        ref={imgRef}
        className="relative w-[400px] h-[400px] border rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src="/product.png"
          alt="Product"
          className="w-full h-full object-cover"
        />

        {/* Lens */}
        {isHovering && (
          <div
            className="absolute w-24 h-24 border-2 border-yellow-400 bg-yellow-200/30 pointer-events-none"
            style={{
              left: `${lensPosition.x - 48}px`,
              top: `${lensPosition.y - 48}px`,
            }}
          />
        )}
      </div>

      {/* Right: zoom preview (only appears when hovering) */}
      {isHovering && (
        <div className="w-[500px] h-[500px] border rounded-lg overflow-hidden">
          <div
            className="w-full h-full bg-no-repeat bg-cover"
            style={{
              backgroundImage: "url('/product.png')",
              backgroundSize: "800px 800px", // zoom level
              backgroundPosition: `-${lensPosition.x * 2 - 100}px -${
                lensPosition.y * 2 - 100
              }px`,
            }}
          />
        </div>
      )}
    </div>
  );
}
