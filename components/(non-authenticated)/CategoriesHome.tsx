"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import LoadingContent from "../loaidng/LoaidngCotent";

interface Category {
  categoryId: string;
  name: string;
  categoryImageUrl: string;
}

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`)
      .then(response => {
        setCategories(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-scroll scrollbar-none px-8 py-6">
        {[...Array(8)].map((_, index) => (
          <LoadingContent
            className="sm:h-[140px] h-[80px] w-[100px] sm:w-[200px] mr-3 flex-shrink-0"
            key={index}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-4 pb-2 px-4">
      <Carousel opts={{ align: "start" }} className="">
        <CarouselContent>
          {categories.map(category => (
            <CarouselItem
              key={category.categoryId}
              className="basis-1/4 sm:basis-1/5 md:basis-1/6"
            >
              <div className="p-1 ">
                <Card
                  className="border-none shadow-none hover:bg-gray-50 transition-colors  cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/homepage/products?category=${category.categoryId}`
                    )
                  }
                >
                  <CardContent className="flex flex-col  items-center p-2  ">
                    <div className="rounded-full bg-white p-2 mb-2 w-16 h-16 flex items-center justify-center">
                      <Image
                        src={category.categoryImageUrl || "/etech-logo.jpg"}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="object-contain"
                        onError={e => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=48&width=48";
                        }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-center line-clamp-2">
                      {category.name}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 sm:left-2" />
        <CarouselNext className="right-1 sm:right-2" />
      </Carousel>
    </div>
  );
}
