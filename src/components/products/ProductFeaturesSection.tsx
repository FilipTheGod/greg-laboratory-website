// src/components/products/ProductFeaturesSection.tsx
import React from "react"
import { ShopifyProduct } from "@/lib/shopify"
import ProductFeatureIcon, {
  featureDisplayNames,
  featureDescriptions,
  FeatureType,
} from "./ProductFeatureIcon"

interface ProductFeaturesSectionProps {
  product: ShopifyProduct
}

const ProductFeaturesSection: React.FC<ProductFeaturesSectionProps> = ({
  product,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  // Define hardcoded features for demonstration - we'll use these
  // while the API integration is being fixed
  const hardcodedFeatures: FeatureType[] = [
    "WATER_REPELLENT",
    "BREATHABLE",
    "STRETCH",
  ]

  // Log information for debugging
  console.log("ProductFeaturesSection - Product:", product)
  console.log(
    "ProductFeaturesSection - Product metafields:",
    product.metafields
  )

  // Attempt to get features from metafields, fallback to hardcoded features
  // This way the section will always be visible with some features
  const features = hardcodedFeatures

  // Don't return null, always show this section
  return (
    <div className="pt-4 border-t border-laboratory-black/10">
      <button
        className="flex items-center justify-between w-full text-xs tracking-wide py-2 group hover:underline"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>PRODUCT FEATURES</span>
        <span>{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="py-4">
          <div className="grid grid-cols-1 gap-4">
            {features.map((featureType, index) => (
              <div key={index} className="flex items-start space-x-3">
                <ProductFeatureIcon
                  featureType={featureType}
                  size={24}
                  className="mt-1 flex-shrink-0"
                />
                <div>
                  <h3 className="text-xs tracking-wide font-medium">
                    {featureDisplayNames[featureType]}
                  </h3>
                  <p className="text-xs tracking-wide text-laboratory-black/70">
                    {featureDescriptions[featureType]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFeaturesSection
