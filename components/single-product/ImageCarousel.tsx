"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: { imageUrl: string }[];
  name: string;
}

function ImageCarousel({ images, name }: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="relative">
      <Carousel setApi={setApi}>
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative h-96 w-full">
                <Image
                  src={img.imageUrl}
                  alt={`${name} ${index + 1}`}
                  fill
                  sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw"
                  priority={index === 0}
                  className="w-full rounded-md object-cover"
                  unoptimized={true}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {/* THUMBNAILS */}
      <div className="flex gap-2 mt-4 overflow-x-auto">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
              current === index
                ? "border-primary"
                : "border-transparent hover:border-primary"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={img.imageUrl}
              alt={`${name} thumbnail ${index + 1}`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;
