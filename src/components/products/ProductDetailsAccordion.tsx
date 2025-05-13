// src/components/products/ProductDetailsAccordion.tsx
"use client"

import React from "react"
import { ShopifyProduct } from "@/lib/shopify"
import { getProductFeatures } from "@/lib/shopify-metafields"
import ProductFeatureIcon, {
  featureDisplayNames,
  featureDescriptions,
  FeatureType,
} from "./ProductFeatureIcon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ProductDetailsAccordionProps {
  product: ShopifyProduct
}

const ProductDetailsAccordion: React.FC<ProductDetailsAccordionProps> = ({
  product,
}) => {
  const [features, setFeatures] = React.useState<FeatureType[]>([])

  // Extract features from product metafields
  React.useEffect(() => {
    // Try to get features from metafields
    const metafieldFeatures = getProductFeatures(product)

    if (metafieldFeatures.length > 0) {
      setFeatures(metafieldFeatures)
    } else {
      // If no features found and product handle matches certain criteria,
      // provide some default features as a fallback
      if (product.handle.includes("pc-fs-t24")) {
        // This is just an example - update with appropriate defaults if needed
        setFeatures([
          "STRETCH",
          "BREATHABLE",
          "WATER_REPELLENT",
        ] as FeatureType[])
      } else {
        // For other products, use some generic defaults to ensure section is always visible
        setFeatures(["LIGHT_WEIGHT"] as FeatureType[])
      }
    }
  }, [product])

  return (
    <Accordion
      type="multiple"
      defaultValue={["product-details", "product-features", "returns"]}
      className="w-full mb-12 md:mb-4"
    >
      <AccordionItem
        value="product-details"
        className="border-t border-laboratory-black/10 border-b-0"
      >
        <AccordionTrigger className="text-xs tracking-wide py-4">
          PRODUCT DETAILS
        </AccordionTrigger>
        <AccordionContent className="text-xs tracking-normal">
          <div
            className="product-description"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="product-features"
        className="border-t border-laboratory-black/10 border-b-0"
      >
        <AccordionTrigger className="text-xs tracking-wide py-4">
          PRODUCT FEATURES
        </AccordionTrigger>
        <AccordionContent>
          {features.length > 0 ? (
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
                    <p className="text-xs tracking-normal text-laboratory-black/70">
                      {featureDescriptions[featureType]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs tracking-wide text-laboratory-black/50">
              This product&apos;s features are being updated.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* New Returns Accordion Item */}
      <AccordionItem
        value="returns"
        className="border-t border-laboratory-black/10 border-b-0"
      >
        <AccordionTrigger className="text-xs tracking-wide py-4">
          RETURNS
        </AccordionTrigger>
        <AccordionContent className="text-xs tracking-normal">
          <p>
            Greg Laboratory is a small business making limited quantities of each garment.
            We do not accept returns or refunds.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ProductDetailsAccordion