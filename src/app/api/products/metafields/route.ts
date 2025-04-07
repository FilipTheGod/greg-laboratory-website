// src/app/api/products/metafields/route.ts
import { NextResponse } from "next/server"
import { FeatureType } from "@/components/products/ProductFeatureIcon"

/**
 * This API endpoint returns all available product features
 * that can be set in Shopify metafields
 */
export async function GET() {
  try {
    // List of all available features
    const features: FeatureType[] = [
      "WATER_REPELLENT",
      "BREATHABLE",
      "STRETCH",
      "LIGHT_WEIGHT",
      "QUICK_DRY",
      "ANTI_PILLING",
      "EASY_CARE",
      "ANTISTATIC_THREAD",
      "KEEP_WARM",
      "COTTON_TOUCH",
      "UV_CUT",
      "WASHABLE",
      "ECO",
      "WATER_PROOF",
      "WATER_ABSORPTION",
    ]

    // Return the list of features
    return NextResponse.json({
      features,
      message: "These feature IDs can be used in Shopify product metafields",
    })
  } catch (error) {
    console.error("Error in features API:", error)
    return NextResponse.json(
      { error: "Failed to retrieve features" },
      { status: 500 }
    )
  }
}
