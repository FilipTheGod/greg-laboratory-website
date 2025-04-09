// src/components/products/ProductFeaturesSection.tsx
import React from "react"
import { ShopifyProduct } from "@/lib/shopify"
import { getProductFeatures } from "@/lib/shopify-metafields"
import ProductFeatureIcon, {
  featureDisplayNames,
  featureDescriptions,
} from "./ProductFeatureIcon"

interface ProductFeaturesSectionProps {
  product: ShopifyProduct
}

const ProductFeaturesSection: React.FC<ProductFeaturesSectionProps> = ({
  product,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  // Get feature IDs from metafields
  const featureTypes = getProductFeatures(product)

  console.log("Product in ProductFeaturesSection:", product)
  console.log("Product metafields:", product.metafields)
  console.log("Features extracted:", featureTypes)

  // If no features found, don't render anything
  if (featureTypes.length === 0) {
    return null
  }

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
            {featureTypes.map((featureType, index) => (
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
