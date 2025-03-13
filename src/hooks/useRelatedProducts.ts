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

        setColorVariants(data.colorVariants)
        setCurrentColor(data.currentColor)
        setBaseSku(data.baseSku)

        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify(data))
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
