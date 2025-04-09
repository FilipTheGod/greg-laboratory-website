// src/lib/shopify-metafields.ts (updated)
import { FeatureType } from "@/components/products/ProductFeatureIcon"
import { ShopifyProduct } from "./shopify"

// Mapping between feature types and their metafield keys
const featureMetafieldKeys: Record<FeatureType, string> = {
  WATER_REPELLENT: "water_repellent",
  BREATHABLE: "breathable",
  STRETCH: "stretch",
  LIGHT_WEIGHT: "light_weight",
  QUICK_DRY: "quick_dry",
  ANTI_PILLING: "anti_pilling",
  EASY_CARE: "easy_care",
  ANTISTATIC_THREAD: "antistatic_thread",
  KEEP_WARM: "keep_warm",
  COTTON_TOUCH: "cotton_touch",
  UV_CUT: "uv_cut",
  WASHABLE: "washable",
  ECO: "eco",
  WATER_PROOF: "water_proof",
  WATER_ABSORPTION: "water_absorption",
}

/**
 * Extracts product features from individual metafields
 * @param product The Shopify product object
 * @returns Array of feature types
 */
export function getProductFeatures(product: ShopifyProduct): FeatureType[] {
  if (!product.metafields) {
    return []
  }

  const features: FeatureType[] = []

  // Check each feature metafield
  Object.entries(featureMetafieldKeys).forEach(([featureType, key]) => {
    // Look for the metafield with the "features" namespace and the specific key
    const metafieldValue = product.metafields?.[`features.${key}`]?.value

    // If the metafield exists and is true, add the feature
    if (metafieldValue === true || metafieldValue === "true") {
      features.push(featureType as FeatureType)
    }
  })

  return features
}

// Rest of the file remains the same...
