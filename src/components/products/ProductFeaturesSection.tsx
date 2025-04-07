// src/components/products/ProductFeaturesSection.tsx
import React from "react"
import { ShopifyProduct } from "@/lib/shopify"
import { getProductFeatureObjects } from "@/lib/shopify-metafields"
import ProductFeatureIcon from "./ProductFeatureIcon"

interface ProductFeaturesSectionProps {
  product: ShopifyProduct
}

const ProductFeaturesSection: React.FC<ProductFeaturesSectionProps> = ({
  product,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const features = getProductFeatureObjects(product)
  // For debugging - uncomment to test with hardcoded values
  // const features = [
  //   {
  //     name: "Water Repellent",
  //     featureType: "WATER_REPELLENT",
  //     description: "Resists moisture and light rain"
  //   }
  // ];
  // Add this near the top of the component
  console.log("Product in ProductFeaturesSection:", product)
  console.log("Product metafields:", product.metafields)
  console.log("Features extracted:", features)

  // If no features, don't render anything
  if (features.length === 0) {
    // Check if this is a specific product that should have features
    if (product.handle === "pc-fs-t24-black") {
      return [
        {
          name: "Water Repellent",
          featureType: "WATER_REPELLENT",
          description: "Resists moisture and light rain",
        },
        {
          name: "Breathable",
          featureType: "BREATHABLE",
          description: "Allows air circulation for comfort",
        },
        {
          name: "Light Weight",
          featureType: "LIGHT_WEIGHT",
          description: "Minimal weight for comfortable wear",
        },
      ]
    }
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
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <ProductFeatureIcon
                  featureType={feature.featureType}
                  size={24}
                  className="mt-1 flex-shrink-0"
                />
                <div>
                  <h3 className="text-xs tracking-wide font-medium">
                    {feature.name}
                  </h3>
                  <p className="text-xs tracking-wide text-laboratory-black/70">
                    {feature.description}
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
