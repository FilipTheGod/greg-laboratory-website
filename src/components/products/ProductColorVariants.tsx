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

  // IMPORTANT: Debug logging
  console.log("ProductColorVariants rendering with:", {
    currentColor,
    colorVariantsCount: colorVariants?.length || 0,
    colorVariants
  })

  // Force color display for specific product types
  const productHandle = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';
  let forcedColors: {color: string, handle: string | null, isCurrent: boolean}[] = [];

  // Explicitly handle jackets (PC-SS-J25)
  if (productHandle && productHandle.toUpperCase().includes('PC-SS-J25')) {
    console.log("Forcing colors for jacket:", productHandle);
    const isBlack = productHandle.toLowerCase().includes('black');

    forcedColors = [
      { color: isBlack ? 'Black' : 'Silver', isCurrent: true, handle: null },
      {
        color: isBlack ? 'Silver' : 'Black',
        isCurrent: false,
        // Find the correct handle or use a fallback
        handle: colorVariants.find(v =>
          v.handle.toLowerCase().includes(isBlack ? 'silver' : 'black')
        )?.handle || (isBlack ?
          productHandle.replace('black', 'silver') :
          productHandle.replace('silver', 'black'))
      }
    ];
  }

  // Explicitly handle pants (PC-SS-P23)
  else if (productHandle && productHandle.toUpperCase().includes('PC-SS-P23')) {
    console.log("Forcing colors for pants:", productHandle);
    const isBlack = productHandle.toLowerCase().includes('black');

    forcedColors = [
      { color: isBlack ? 'Black' : 'Beige', isCurrent: true, handle: null },
      {
        color: isBlack ? 'Beige' : 'Black',
        isCurrent: false,
        // Find the correct handle or use a fallback
        handle: colorVariants.find(v =>
          v.handle.toLowerCase().includes(isBlack ? 'beige' : 'black')
        )?.handle || (isBlack ?
          productHandle.replace('black', 'beige') :
          productHandle.replace('beige', 'black'))
      }
    ];
  }

  // Use forced colors if available, otherwise use the normal logic
  const allColors = forcedColors.length > 0 ? forcedColors : [
    // Include the current color if available
    ...(currentColor ? [{ color: currentColor, isCurrent: true, handle: null }] : []),
    // Include other color variants
    ...colorVariants
      .filter(variant =>
        variant.color !== currentColor &&
        variant.color !== "Unknown" &&
        variant.color
      )
      .map((variant) => ({
        color: variant.color,
        handle: variant.handle,
        isCurrent: false,
      })),
  ];

  // Debug the final colors we'll display
  console.log("Final colors to display:", allColors);

  // Force display for specific products, or check the normal conditions
  const shouldDisplay = forcedColors.length > 0 || (allColors.length > 1);

  if (!shouldDisplay) {
    console.log("Not displaying color variants - insufficient colors");
    return null;
  }

  // Handle click on a color swatch
  const handleColorClick = (handle: string) => {
    if (!handle) {
      console.error("Attempted to navigate to empty handle");
      return;
    }

    // Add product/ prefix if it's missing
    const fullPath = handle.startsWith('/product/') ?
      handle :
      `/product/${handle}`;

    console.log("Navigating to:", fullPath);
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