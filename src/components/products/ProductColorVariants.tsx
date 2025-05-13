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
  if (!colorVariants || colorVariants.length === 0) {
    return null
  }

  // Log for debugging
  console.log("Color variants:", colorVariants)
  console.log("Current color:", currentColor)

  // Create a list of all colors including the current one
  const allColors = [
    ...(currentColor ? [{ color: currentColor, isCurrent: true, handle: null }] : []),
    ...colorVariants
      .filter(variant => variant.color !== currentColor) // Avoid duplicates
      .map((variant) => ({
        color: variant.color,
        handle: variant.handle,
        isCurrent: false,
      })),
  ]

  // Handle click on a color swatch
  const handleColorClick = (handle: string) => {
    // Navigate to the product page for the selected color
    router.push(`/product/${handle}`)
  }

  return (
    <div className={`mb-4 ${className}`}>
      <h2 className="text-xs tracking-wide mb-2">COLORS</h2>
      <div className="flex flex-wrap gap-2">
        {allColors.map((colorInfo, index) => (
          <button
            key={`${colorInfo.color}-${index}`}
            className={`w-8 h-8 rounded-full relative transition-all ${
              colorInfo.isCurrent
                ? "ring-1 ring-laboratory-black ring-offset-1"
                : "ring-1 ring-laboratory-black/20 ring-offset-1 hover:opacity-80"
            }`}
            style={getColorStyle(colorInfo.color)}
            onClick={() =>
              !colorInfo.isCurrent && colorInfo.handle &&
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