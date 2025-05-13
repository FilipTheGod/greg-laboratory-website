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

  // Create static arrays and avoid conditional rendering structure differences
  const allColors = React.useMemo(() => {
    // Start with an empty array
    const colors: Array<{color: string, handle: string | null, isCurrent: boolean}> = [];

    // Add current color if it exists
    if (currentColor) {
      colors.push({ color: currentColor, isCurrent: true, handle: null });
    }

    // Add other variants
    colorVariants.forEach(variant => {
      if (variant.color !== currentColor && variant.color !== "Unknown" && variant.color) {
        colors.push({
          color: variant.color,
          handle: variant.handle,
          isCurrent: false,
        });
      }
    });

    return colors;
  }, [currentColor, colorVariants]);

  // Only render the component if we have colors to show
  if (allColors.length <= 1) {
    return null;
  }

  // Handle click on a color swatch
  const handleColorClick = (handle: string) => {
    if (!handle) return;

    // Add product/ prefix if it's missing
    const fullPath = handle.startsWith('/product/') ? handle : `/product/${handle}`;
    router.push(fullPath);
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