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
  // Default features if none are specified
  const defaultFeatures: FeatureType[] = []

  // Check if product has metafields with features
  if (
    product.metafields &&
    product.metafields.features &&
    Array.isArray(product.metafields.features.value)
  ) {
    return product.metafields.features.value as FeatureType[]
  }

  return defaultFeatures
}

/**
 * Returns both feature type and structured objects for display
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
