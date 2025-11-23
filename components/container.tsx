import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
interface containerProps {
  children: ReactNode;
  className?: string;
}

export const Container: React.FC<containerProps> = ({
  className,
  children,
}) => {
  return (
    <div className={cn("max-w-screen-2xl mx-auto   w-full", className)}>
      {children}
    </div>
  );
};
export default Container;
