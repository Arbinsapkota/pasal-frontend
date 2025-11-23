"use client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

const HomeCommingSoon = () => {
 
  return (
    <div>
       <Dialog open={true} >
        <DialogContent className="sm:max-w-[625px] max-w-[380px] p-0">
          <VisuallyHidden>
            <DialogTitle>Welcome!</DialogTitle>
          </VisuallyHidden>
          
          
              <div className="relative rounded shadow-lg">
                <Image
                  src={"/commingsoon.jpg"} // Default to logo if no popup image is available
                  alt="Popup Image"
                  width={800}
                  height={800}
                  className="rounded-lg sm:h-[500px] h-96 w-full object-fill"
                />
              </div>
             
          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeCommingSoon;
