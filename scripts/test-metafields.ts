// scripts/test-metafields.ts
/**
 * A script to test fetching product metafields
 *
 * Run with:
 * npx ts-node scripts/test-metafields.ts your-product-handle
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { getProductByHandle } from "../src/lib/shopify"
import { getProductFeatures } from "../src/lib/shopify-metafields"
import { featureDisplayNames } from "../src/components/products/ProductFeatureIcon"

async function main() {
  try {
    // Get product handle from command line argument
    const handle = process.argv[2]

    if (!handle) {
      console.error("Please provide a product handle as an argument")
      console.log(
        "Example: npx ts-node scripts/test-metafields.ts black-field-jacket"
      )
      process.exit(1)
    }

    console.log(`Testing metafields for product with handle: ${handle}`)

    // Get the product
    console.log("Fetching product...")
    const product = await getProductByHandle(handle)

    if (!product) {
      console.error(`Product not found: ${handle}`)
      process.exit(1)
    }

    console.log(`\nProduct found: ${product.title}`)

    // Log all metafields for inspection
    console.log("\nAll metafields:")
    if (product.metafields && Object.keys(product.metafields).length > 0) {
      for (const key in product.metafields) {
        console.log(`- ${key}: ${JSON.stringify(product.metafields[key])}`)
      }
    } else {
      console.log("No metafields found for this product")
    }

    // Extract and display features
    console.log("\nExtracted Features:")
    const features = getProductFeatures(product)

    if (features.length > 0) {
      features.forEach(feature => {
        console.log(`- ${feature} (${featureDisplayNames[feature]})`)
      })
    } else {
      console.log("No features found for this product")
    }

    console.log("\nTest completed!")
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

main()