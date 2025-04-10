// src/lib/shopify-metafields.ts
import { FeatureType } from "@/components/products/ProductFeatureIcon"
import { ShopifyProduct } from "./shopify"

/**
 * Helper functions for working with Shopify metafields
 */

// Define a mapping between metafield keys and feature types
const metafieldKeyToFeature: Record<string, FeatureType> = {
  stretch: "STRETCH",
  breathable: "BREATHABLE",
  water_repellent: "WATER_REPELLENT",
  light_weight: "LIGHT_WEIGHT",
  quick_dry: "QUICK_DRY",
  anti_pilling: "ANTI_PILLING",
  easy_care: "EASY_CARE",
  antistatic_thread: "ANTISTATIC_THREAD",
  keep_warm: "KEEP_WARM",
  cotton_touch: "COTTON_TOUCH",
  uv_cut: "UV_CUT",
  washable: "WASHABLE",
  eco: "ECO",
  water_proof: "WATER_PROOF",
  water_absorption: "WATER_ABSORPTION",
}

/**
 * Extracts product features from metafields
 * @param product The Shopify product object
 * @returns Array of feature types that are enabled for the product
 */
export function getProductFeatures(product: ShopifyProduct): FeatureType[] {
  if (!product.metafields) {
    console.log("No metafields found on product")
    return []
  }

  console.log("Product metafields:", product.metafields)

  // Initialize an array to hold the enabled features
  const enabledFeatures: FeatureType[] = []

  // Loop through all metafields to find the boolean features
  for (const key in product.metafields) {
    // Skip non-feature metafields
    if (!key.startsWith("features.")) {
      continue
    }

    // Extract the actual feature key after the namespace
    const metafieldKey = key.split(".")[1]

    // Log what we found for debugging
    console.log(`Found metafield key: ${metafieldKey}`)

    // If this is a feature metafield and its value is true, add it to enabled features
    if (metafieldKey in metafieldKeyToFeature) {
      const value = product.metafields[key].value
      console.log(`Feature ${metafieldKey} has value: ${value}`)

      // Check if the feature is enabled (value is true or "true")
      if (value === true || value === "true") {
        console.log(`Adding feature: ${metafieldKeyToFeature[metafieldKey]}`)
        enabledFeatures.push(metafieldKeyToFeature[metafieldKey])
      }
    }
  }

  // For hardcoded testing - uncomment if needed
  /*
  if (product.handle === "pc-fs-t24-black") {
    console.log("Adding hardcoded features for testing");
    if (!enabledFeatures.includes("STRETCH")) enabledFeatures.push("STRETCH");
    if (!enabledFeatures.includes("BREATHABLE")) enabledFeatures.push("BREATHABLE");
    if (!enabledFeatures.includes("WATER_REPELLENT")) enabledFeatures.push("WATER_REPELLENT");
  }
  */

  console.log("Final enabled features:", enabledFeatures)
  return enabledFeatures
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
