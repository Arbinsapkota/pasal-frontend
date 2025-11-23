import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface MaxWidthWrapperProps {
  children: ReactNode;
  className?: string;
}

export const MaxWidthWrapper: React.FC<MaxWidthWrapperProps> = ({
  className = '',  // Fallback to an empty string if no className is provided
  children,
}) => {
  return (
    <div className={cn("max-w-screen-2xl gap-1 mx-auto px-2.5 md:px-20 w-full", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
