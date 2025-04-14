// src/components/products/MobileProductCarousel.tsx
import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ShopifyImage } from "@/lib/shopify"

interface MobileProductCarouselProps {
  images: ShopifyImage[]
  productTitle: string
}

const MobileProductCarousel: React.FC<MobileProductCarouselProps> = ({
  images,
  productTitle,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Listen for scroll events to update current slide
  useEffect(() => {
    // Skip effect if there are no images
    if (!images || images.length === 0) return

    const handleScroll = () => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft
        const slideWidth = containerRef.current.offsetWidth
        const newIndex = Math.round(scrollLeft / slideWidth)
        if (newIndex !== currentSlide) {
          setCurrentSlide(newIndex)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [currentSlide, images])

  // If there are no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-laboratory-white flex items-center justify-center">
        <span className="text-laboratory-black/30 text-xs tracking-wide">
          No Images Available
        </span>
      </div>
    )
  }

  // Handle dot navigation - scroll to the selected slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    if (containerRef.current) {
      const slideWidth = containerRef.current.offsetWidth
      containerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="mobile-carousel-wrapper">
      {/* Scrollable container */}
      <div ref={containerRef} className="mobile-carousel-container">
        {images.map((image, index) => (
          <div key={index} className="mobile-carousel-slide">
            <div className="relative aspect-square w-full">
              <Image
                src={image.src}
                alt={image.altText || `${productTitle} - image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicator dots */}
      {images.length > 1 && (
        <div className="flex justify-center mt-2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index
                  ? "bg-laboratory-black"
                  : "bg-laboratory-black/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MobileProductCarousel
