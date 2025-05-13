// src/components/products/ProductColorVariants.tsx
import React from "react"
import { useRouter } from "next/navigation"
import { getColorStyle } from "@/utils/colors"

interface ColorVariant {
  id: string
  handle: string
  title: string
  color: string
  image: string | null
}

interface ProductColorVariantsProps {
  currentColor: string | null
  colorVariants: ColorVariant[]
  className?: string
}

const ProductColorVariants: React.FC<ProductColorVariantsProps> = ({
  currentColor,
  colorVariants,
  className = "",
}) => {
  const router = useRouter()

  // If there are no color variants, don't render anything
  if (colorVariants.length === 0) {
    return null
  }

  // Create a list of all colors including the current one
  const allColors = [
    ...(currentColor ? [{ color: currentColor, isCurrent: true }] : []),
    ...colorVariants.map((variant) => ({
      color: variant.color,
      handle: variant.handle,
      isCurrent: false,
    })),
  ]

  // Handle click on a color swatch
  const handleColorClick = (handle: string) => {
    router.push(`/product/${handle}`)
  }

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {allColors.map((colorInfo) => (
          <button
            key={colorInfo.color}
            className={`w-8 h-8 rounded-full relative transition-all ${
              colorInfo.isCurrent
                ? "ring-1 ring-laboratory-black ring-offset-1"
                : "ring-1 ring-laboratory-black/20 ring-offset-1 hover:opacity-80"
            }`}
            style={getColorStyle(colorInfo.color)}
            onClick={() =>
              !colorInfo.isCurrent &&
              "handle" in colorInfo &&
              handleColorClick(colorInfo.handle)
            }
            aria-label={`Color: ${colorInfo.color}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductColorVariants