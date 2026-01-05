"use client";

import { useEffect, useState } from "react";

interface SimpleCarouselProps {
  images: { src: string; alt: string }[];
  intervalMs?: number;
  className?: string;
}

export default function SimpleCarousel({ images, intervalMs = 4000, className = "" }: SimpleCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [images, intervalMs]);

  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-gray-900" />;
  }

  return (
    <div className={`relative w-full h-full bg-gray-900 overflow-hidden ${className}`}>
      {images.map((img, i) => (
        <div
          key={`${i}-${img.src}`}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            opacity: i === index ? 1 : 0,
            transition: "opacity 700ms ease-in-out",
          }}
        >
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      ))}

      {/* gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-20" />

      {/* dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all ${
                i === index ? "bg-white w-6 h-2" : "bg-white/50 w-2 h-2"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
