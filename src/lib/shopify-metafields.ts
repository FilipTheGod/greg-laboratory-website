// src/lib/shopify-metafields.ts
import {
  FeatureType,
  featureDisplayNames,
  featureDescriptions,
} from "@/components/products/ProductFeatureIcon"
import { ShopifyProduct } from "./shopify"

/**
 * Helper functions for working with Shopify metafields
 */

/**
 * Extracts product features from metafields
 * @param product The Shopify product object
 * @returns Array of feature types
 */
export function getProductFeatures(product: ShopifyProduct): FeatureType[] {
  // Check for the 'features' metafield - this matches what's in your Shopify store
  if (!product.metafields?.features?.value) {
    return []
  }

  try {
    // Handle both string and array format for metafields
    let features: string[]

    if (typeof product.metafields.features.value === "string") {
      features = JSON.parse(product.metafields.features.value)
    } else {
      features = product.metafields.features.value as string[]
    }

    // Filter to only include valid feature types
    return features.filter((feature): feature is FeatureType =>
      Object.keys(featureDisplayNames).includes(feature as string)
    )
  } catch (error) {
    console.error("Error parsing product features:", error)
    return []
  }
}

/**
 * Returns feature objects for display with name, type and description
 * @param product The Shopify product object
 * @returns Feature objects with name, type and description
 */
export function getProductFeatureObjects(product: ShopifyProduct) {
  const featureTypes = getProductFeatures(product)

  // Map features to attribute objects
  return featureTypes.map((featureType) => ({
    name: featureDisplayNames[featureType] || "Unknown Feature",
    featureType: featureType,
    description: featureDescriptions[featureType] || "No description available",
  }))
}

/**
 * Utility function to determine if a product has a specific feature
 * @param product The Shopify product
 * @param featureType The feature type to check for
 * @returns boolean indicating if product has the feature
 */
export function productHasFeature(
  product: ShopifyProduct,
  featureType: FeatureType
): boolean {
  const features = getProductFeatures(product)
  return features.includes(featureType)
}
