// src/components/products/MobileProductCarousel.tsx
import React, { useState, useRef } from "react"
import Image from "next/image"
import { motion, PanInfo } from "framer-motion"
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
  const [isDragging, setIsDragging] = useState(false)

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

  // Handle drag start
  const handleDragStart = (): void => {
    setIsDragging(true)
  }

  // Handle drag end to determine which slide to show
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    setIsDragging(false)

    // Prevent scrolling if there's only one image
    if (images.length <= 1) return

    const dragDistance = info.offset.x
    const swipeThreshold = 50 // Minimum distance to trigger slide change

    if (Math.abs(dragDistance) < swipeThreshold) {
      // If the drag wasn't substantial, snap back to current slide
      return
    }

    if (dragDistance > 0 && currentSlide > 0) {
      // Dragged right, go to previous slide
      setCurrentSlide((prev) => Math.max(0, prev - 1))
    } else if (dragDistance < 0 && currentSlide < images.length - 1) {
      // Dragged left, go to next slide
      setCurrentSlide((prev) => Math.min(images.length - 1, prev + 1))
    }
  }

  // Handle direct clicks on the indicator dots
  const handleDotClick = (index: number): void => {
    // Only respond if not currently dragging
    if (!isDragging) {
      setCurrentSlide(index)
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
            dragElastic={0.1} // Reduced elasticity to prevent excessive stretching
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="flex h-full touch-pan-y"
            animate={{ x: -currentSlide * 100 + "%" }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              type: "tween", // Use tween instead of spring for more predictable movement
            }}
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
        </div>

        {/* Slide Indicators - Only show if more than one image */}
        {images.length > 1 && (
          <div className="flex justify-center mt-2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
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
