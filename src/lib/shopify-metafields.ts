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
// src/lib/shopify-metafields.ts
export function getProductFeatures(product: ShopifyProduct): FeatureType[] {
  if (!product.metafields?.features?.value) {
    return [];
  }

  try {
    const features = typeof product.metafields.features.value === 'string'
      ? JSON.parse(product.metafields.features.value)
      : product.metafields.features.value;

    return features.filter((feature: string): feature is FeatureType =>
      Object.values(FeatureType).includes(feature as FeatureType)
    );
  } catch (error) {
    console.error('Error parsing product features:', error);
    return [];
  }
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
