// scripts/update-product-features.ts
/**
 * A script to test updating product features directly
 *
 * Run with:
 * npx ts-node scripts/update-product-features.ts
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import {
  getProductIdFromHandle,
  updateProductFeatures,
} from "../src/lib/shopify-admin"

async function main() {
  try {
    // Product handle to update
    const handle = process.argv[2]

    if (!handle) {
      console.error("Please provide a product handle as an argument")
      console.log(
        "Example: npx ts-node scripts/update-product-features.ts black-field-jacket"
      )
      process.exit(1)
    }

    // Example features to set
    const features = ["WATER_REPELLENT", "BREATHABLE", "LIGHT_WEIGHT"]

    console.log(`Updating features for product with handle: ${handle}`)
    console.log(`Features to set: ${features.join(", ")}`)

    // Get the product ID from handle
    console.log("Getting product ID...")
    const productId = await getProductIdFromHandle(handle)
    console.log(`Product ID: ${productId}`)

    // Update the features
    console.log("Updating features...")
    const result = await updateProductFeatures(productId, features)

    console.log("Success! Features updated.")
    console.log("Result:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

main()
