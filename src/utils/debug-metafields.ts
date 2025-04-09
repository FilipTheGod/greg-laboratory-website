// src/utils/debug-metafields.ts
import { ShopifyProduct } from "@/lib/shopify"

/**
 * Utility function to debug metafields from Shopify
 * Logs detailed information about the structure of metafields
 */
export function debugMetafields(product: ShopifyProduct) {
  console.group('Metafields Debug for product:', product.title)

  if (!product.metafields || Object.keys(product.metafields).length === 0) {
    console.log('No metafields found for this product')
    console.groupEnd()
    return
  }

  console.log('Metafields keys:', Object.keys(product.metafields))

  // Log each metafield's structure and content
  for (const key in product.metafields) {
    const metafield = product.metafields[key]
    console.group(`Metafield: ${key}`)
    console.log('Value:', metafield.value)
    console.log('Type:', metafield.type)
    console.log('Full metafield object:', metafield)
    console.groupEnd()
  }

  // Look for specific feature metafields
  const featureKeywords = ['stretch', 'breathable', 'water', 'repellent']
  console.log('Checking for feature-related metafields')

  for (const key in product.metafields) {
    const lowercaseKey = key.toLowerCase()
    for (const keyword of featureKeywords) {
      if (lowercaseKey.includes(keyword)) {
        console.log(`Found possible feature metafield: ${key} =`, product.metafields[key])
      }
    }
  }

  console.groupEnd()
}