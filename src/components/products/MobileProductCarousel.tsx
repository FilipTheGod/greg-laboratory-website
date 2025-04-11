// src/components/products/MobileProductCarousel.tsx
import React, { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
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
  const carouselRef = useRef<HTMLDivElement>(null)

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

  // Function to navigate to next slide
  const nextSlide = () => {
    if (images.length <= 1) return
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Function to navigate to previous slide
  const prevSlide = () => {
    if (images.length <= 1) return
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Function to go to specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Handle swipe gestures
  const handleSwipe = (direction: number) => {
    if (direction > 0) {
      prevSlide()
    } else {
      nextSlide()
    }
  }

  return (
    <div className="w-full product-carousel-container">
      <div className="relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden w-full aspect-square product-carousel">
          <motion.div
            ref={carouselRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => handleSwipe(info.offset.x)}
            className="flex h-full"
            animate={{ x: -currentSlide * 100 + "%" }}
            transition={{ duration: 0.3 }}
            style={{ width: `${images.length * 100}%` }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square bg-laboratory-white"
                style={{ width: `${100 / images.length}%` }}
              >
                <Image
                  src={image.src}
                  alt={image.altText || `${productTitle} - view ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </motion.div>

          {/* Navigation Arrows - Only show if more than one image */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-laboratory-white/70 w-8 h-8 flex items-center justify-center z-10 text-laboratory-black rounded-full"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-laboratory-white/70 w-8 h-8 flex items-center justify-center z-10 text-laboratory-black rounded-full"
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Slide Indicators - Only show if more than one image */}
        {images.length > 1 && (
          <div className="flex justify-center mt-2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full carousel-dot ${
                  currentSlide === index
                    ? "bg-laboratory-black active"
                    : "bg-laboratory-black/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileProductCarousel
