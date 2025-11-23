import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

const LoadingContent = ({ className }: { className?: string }) => {
  return (
    <>
      <div
        className={cn(
          // buttonVariants({ variant: "loadingShimmer" }),
          "   transition-all w-full h-full  opacity-90 bg-gray-300 dark:bg-gray-400 animate-pulse  ease-linear rounded-md my-2",
          className
        )}
        style={{ animationDuration: "5sec" }}
      ></div>
    </>
  );
};

export default LoadingContent;
