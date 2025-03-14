// src/components/products/ProductFeatureIcon.tsx
import React from "react"
import Image from "next/image"

export type FeatureType =
  | "WATER_REPELLENT"
  | "BREATHABLE"
  | "STRETCH"
  | "LIGHT_WEIGHT"
  | "QUICK_DRY"
  | "ANTI_PILLING"
  | "EASY_CARE"
  | "ANTISTATIC_THREAD"
  | "KEEP_WARM"
  | "COTTON_TOUCH"
  | "UV_CUT"
  | "WASHABLE"
  | "ECO"
  | "WATER_ABSORPTION"

// Mapping of feature types to their display names
export const featureDisplayNames: Record<FeatureType, string> = {
  WATER_REPELLENT: "Water Repellent",
  BREATHABLE: "Breathable",
  STRETCH: "Stretch",
  LIGHT_WEIGHT: "Light Weight",
  QUICK_DRY: "Quick Dry",
  ANTI_PILLING: "Anti-Pilling",
  EASY_CARE: "Easy Care",
  ANTISTATIC_THREAD: "Antistatic Thread",
  KEEP_WARM: "Keep Warm",
  COTTON_TOUCH: "Cotton Touch",
  UV_CUT: "UV Cut",
  WASHABLE: "Washable",
  ECO: "Eco",
  WATER_ABSORPTION: "Water Absorption",
}

// Mapping of feature types to their descriptions
export const featureDescriptions: Record<FeatureType, string> = {
  WATER_REPELLENT: "Resists moisture and light rain",
  BREATHABLE: "Allows air circulation for comfort",
  STRETCH: "Flexible movement in multiple directions",
  LIGHT_WEIGHT: "Minimal weight for comfortable wear",
  QUICK_DRY: "Dries rapidly after exposure to moisture",
  ANTI_PILLING: "Resists the formation of fabric pills",
  EASY_CARE: "Simple maintenance and washing requirements",
  ANTISTATIC_THREAD: "Reduces static electricity buildup",
  KEEP_WARM: "Retains body heat for better insulation",
  COTTON_TOUCH: "Soft feel similar to natural cotton",
  UV_CUT: "Protects from harmful ultraviolet rays",
  WASHABLE: "Can be machine or hand washed easily",
  ECO: "Environmentally friendly materials and production",
  WATER_ABSORPTION: "Effectively absorbs and wicks moisture",
}

// Mapping of feature types to their SVG paths
const featureIconPaths: Record<FeatureType, string> = {
  WATER_REPELLENT: "/svg/WATER REPELLENT.svg",
  BREATHABLE: "/svg/BREATHABLE.svg",
  STRETCH: "/svg/STRETCH.svg",
  LIGHT_WEIGHT: "/svg/LIGHT WEIGHT.svg",
  QUICK_DRY: "/svg/QUICKDRY.svg",
  ANTI_PILLING: "/svg/ANTI-PILLING.svg",
  EASY_CARE: "/svg/EASY CARE.svg",
  ANTISTATIC_THREAD: "/svg/ANTISTATIC THREAD.svg",
  KEEP_WARM: "/svg/KEEP WARM.svg",
  COTTON_TOUCH: "/svg/COTTON TOUCH.svg",
  UV_CUT: "/svg/UV CUT.svg",
  WASHABLE: "/svg/WASHABLE.svg",
  ECO: "/svg/ECO.svg",
  WATER_ABSORPTION: "/svg/WATER ABSORBTION.svg",
}

interface ProductFeatureIconProps {
  featureType: FeatureType
  size?: number
  className?: string
}

const ProductFeatureIcon: React.FC<ProductFeatureIconProps> = ({
  featureType,
  size = 20,
  className = "",
}) => {
  const iconPath = featureIconPaths[featureType]

  if (!iconPath) {
    console.warn(`No icon found for feature: ${featureType}`)
    return null
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconPath}
        alt={featureDisplayNames[featureType] || featureType}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}

export default ProductFeatureIcon
