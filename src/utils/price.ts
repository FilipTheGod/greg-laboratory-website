// src/utils/price.ts
import { MoneyV2 } from "@/lib/shopify"

/**
 * Utility functions for handling price formatting
 */

type PriceInput = string | number | MoneyV2 | null | undefined

/**
 * Extracts the numeric price amount from either a string or object price
 *
 * @param price - The price value which can be a string or a Shopify price object
 * @returns The price as a string, formatted with 2 decimal places
 */
export function formatPrice(price: PriceInput): string {
  try {
    if (typeof price === "string") {
      return parseFloat(price).toFixed(2)
    }

    if (typeof price === "number") {
      return price.toFixed(2)
    }

    if (typeof price === "object" && price !== null) {
      if ("amount" in price && price.amount) {
        return parseFloat(price.amount).toFixed(2)
      }

      // Fall back to stringifying and trying to parse
      const priceStr = String(price)
      const parsedPrice = parseFloat(priceStr)

      if (!isNaN(parsedPrice)) {
        return parsedPrice.toFixed(2)
      }
    }

    // Default fallback
    return "0.00"
  } catch (error) {
    console.error("Error formatting price:", error)
    return "0.00"
  }
}

/**
 * Safely extracts a numeric price value for calculations
 *
 * @param price - The price value which can be a string or a Shopify price object
 * @returns The price as a number or 0 if invalid
 */
export function getPriceValue(price: PriceInput): number {
  try {
    if (typeof price === "number") {
      return price
    }

    if (typeof price === "string") {
      return parseFloat(price) || 0
    }

    if (typeof price === "object" && price !== null) {
      if ("amount" in price && price.amount) {
        return parseFloat(price.amount) || 0
      }
    }

    return 0
  } catch (error) {
    console.error("Error extracting price value:", error)
    return 0
  }
}
