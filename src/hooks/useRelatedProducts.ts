// src/hooks/useRelatedProducts.ts - Enhanced version
import { useState, useEffect } from "react"


interface ColorVariant {
  id: string
  handle: string
  title: string
  color: string
  image: string | null
}

interface RelatedProductsResponse {
  baseSku: string
  currentColor: string | null
  colorVariants: ColorVariant[]
}

export function useRelatedProducts(productHandle: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])
  const [currentColor, setCurrentColor] = useState<string | null>(null)
  const [baseSku, setBaseSku] = useState<string>("")

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productHandle) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Helper function to extract color from product handle
        const extractColorFromHandle = (handle: string): string | null => {
          // Pattern: Look for the last dash followed by a color name
          const parts = handle.split("-")

          // Common color names that might appear at the end of a handle
          const commonColors = [
            "black",
            "cream",
            "white",
            "navy",
            "olive",
            "grey",
            "khaki",
            "tan",
            "brown",
            "natural",
            "green",
            "blue",
            "red",
            "pink",
            "stone",
            "sand",
            "beige",
            "silver"  // Adding silver as it might be used
          ]

          // Check if the last part is a color
          const lastPart = parts[parts.length - 1].toLowerCase()
          if (commonColors.includes(lastPart)) {
            // Return the color with first letter capitalized
            return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
          }

          // If we didn't find a color in the handle, try extracting from title
          return null
        }

        // Check if we have cached results
        const cacheKey = `related_products_${productHandle}`
        const cachedData = sessionStorage.getItem(cacheKey)

        if (cachedData) {
          const parsed = JSON.parse(cachedData) as RelatedProductsResponse
          setColorVariants(parsed.colorVariants)
          setCurrentColor(parsed.currentColor)
          setBaseSku(parsed.baseSku)
          setIsLoading(false)
          return
        }

        // Fetch from API if no cache
        const response = await fetch(`/api/products/related/${productHandle}`)

        if (!response.ok) {
          throw new Error(
            `Failed to fetch related products: ${response.status}`
          )
        }

        const data = (await response.json()) as RelatedProductsResponse

        // Extract current color from handle if not provided by API
        if (!data.currentColor) {
          data.currentColor = extractColorFromHandle(productHandle) || null;
        }

        // Ensure all color variants have color values
        const enhancedVariants = data.colorVariants.map(variant => {
          if (!variant.color) {
            return {
              ...variant,
              color: extractColorFromHandle(variant.handle) || "Unknown"
            };
          }
          return variant;
        });

        setColorVariants(enhancedVariants)
        setCurrentColor(data.currentColor)
        setBaseSku(data.baseSku)

        // Cache the results with enhanced data
        const enhancedData = {
          ...data,
          colorVariants: enhancedVariants,
          currentColor: data.currentColor
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(enhancedData))
      } catch (err) {
        console.error("Error in useRelatedProducts:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [productHandle])

  return {
    isLoading,
    error,
    colorVariants,
    currentColor,
    baseSku,
    hasColorVariants: colorVariants.length > 0,
  }
}