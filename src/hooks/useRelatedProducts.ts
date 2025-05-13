// src/hooks/useRelatedProducts.ts
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
        // Helper function to extract color from product handle/title
        const extractColorFromText = (text: string): string | null => {
          const lowerText = text.toLowerCase()

          // Common color names that might appear
          const commonColors = [
            "black", "beige", "cream", "white", "navy", "olive", "grey", "gray",
            "khaki", "tan", "brown", "natural", "green", "blue", "red", "pink",
            "stone", "sand", "silver"
          ]

          for (const color of commonColors) {
            // Check for exact match with word boundaries
            const regex = new RegExp(`\\b${color}\\b`, 'i')
            if (regex.test(lowerText)) {
              return color.charAt(0).toUpperCase() + color.slice(1)
            }
          }

          return null
        }

        // Check if we have cached results
        const cacheKey = `related_products_${productHandle}`
        let cachedData = null

        try {
          const cachedString = sessionStorage.getItem(cacheKey)
          if (cachedString) {
            cachedData = JSON.parse(cachedString) as RelatedProductsResponse
          }
        } catch (err) {
          console.warn("Error accessing cache:", err)
        }

        if (cachedData) {
          setColorVariants(cachedData.colorVariants)
          setCurrentColor(cachedData.currentColor)
          setBaseSku(cachedData.baseSku)
          setIsLoading(false)
          return
        }

        // Fetch from API if no cache
        console.log(`Fetching related products for: ${productHandle}`)

        const response = await fetch(`/api/products/related/${productHandle}`)

        if (!response.ok) {
          throw new Error(
            `Failed to fetch related products: ${response.status}`
          )
        }

        const data = await response.json()
        console.log("API response:", data)

        // Extract current color from handle/title if not provided by API
        if (!data.currentColor) {
          data.currentColor = extractColorFromText(productHandle) || null
        }

        // Ensure all color variants have color values
        const enhancedVariants = data.colorVariants.map((variant: ColorVariant) => {
          if (!variant.color || variant.color === "Unknown") {
            return {
              ...variant,
              color: extractColorFromText(variant.handle) ||
                     extractColorFromText(variant.title) ||
                     "Unknown"
            }
          }
          return variant
        })

        console.log("Enhanced variants:", enhancedVariants)

        setColorVariants(enhancedVariants)
        setCurrentColor(data.currentColor)
        setBaseSku(data.baseSku)

        // Cache the results with enhanced data
        try {
          const enhancedData = {
            ...data,
            colorVariants: enhancedVariants,
            currentColor: data.currentColor
          }
          sessionStorage.setItem(cacheKey, JSON.stringify(enhancedData))
        } catch (err) {
          console.warn("Error caching data:", err)
        }
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