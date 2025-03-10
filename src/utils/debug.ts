// src/utils/debug.ts
import { ShopifyProduct, ShopifyMedia } from "@/lib/shopify"

/**
 * Comprehensive debugging utility for product data
 */
export function debugProduct(
  product: ShopifyProduct,
  label = "Product Debug"
): void {
  if (process.env.NODE_ENV !== "development") return

  console.group(`${label}: ${product.title} (${product.handle})`)

  // Basic product info
  console.log("Basic Info:", {
    id: product.id,
    handle: product.handle,
    title: product.title,
    type: product.productType,
    variantsCount: product.variants?.length || 0,
    imagesCount: product.images?.length || 0,
    mediaCount: product.media?.length || 0,
  })

  // Price debugging
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0]
    console.log("Price Info:", {
      priceRawValue: firstVariant.price,
      priceType: typeof firstVariant.price,
      isPriceObject: typeof firstVariant.price === "object",
      priceObjectKeys:
        typeof firstVariant.price === "object"
          ? Object.keys(firstVariant.price)
          : "N/A",
      amount:
        typeof firstVariant.price === "object"
          ? firstVariant.price.amount
          : "N/A",
      formattedPrice: formatPrice(firstVariant.price),
    })
  }

  // Media debugging
  if (product.media && product.media.length > 0) {
    console.log("Media Summary:", {
      totalMedia: product.media.length,
      videoCount: product.media.filter((m) => m.mediaContentType === "VIDEO")
        .length,
      imageCount: product.media.filter((m) => m.mediaContentType === "IMAGE")
        .length,
      otherMediaCount: product.media.filter(
        (m) => !["VIDEO", "IMAGE"].includes(m.mediaContentType)
      ).length,
    })

    // Detailed first media item inspection
    const firstMedia = product.media[0]
    console.log("First Media Item:", {
      id: firstMedia.id,
      type: firstMedia.mediaContentType,
      hasSources: !!firstMedia.sources,
      sourcesCount: firstMedia.sources?.length || 0,
      hasPreviewImage: !!firstMedia.previewImage,
    })

    // Check all video media
    const videoMedia = product.media.filter(
      (m) => m.mediaContentType === "VIDEO"
    )
    if (videoMedia.length > 0) {
      console.log(
        "Video Media Items:",
        videoMedia.map((video) => ({
          id: video.id,
          hasSources: !!video.sources,
          sourcesCount: video.sources?.length || 0,
          firstSourceUrl: video.sources?.[0]?.url || "No URL",
          firstSourceMimeType: video.sources?.[0]?.mimeType || "No MIME type",
        }))
      )
    }
  }

  console.groupEnd()
}

/**
 * Simple price formatter
 */
function formatPrice(price: any): string {
  try {
    if (typeof price === "string") {
      return parseFloat(price).toFixed(2)
    }

    if (typeof price === "object" && price !== null) {
      if (price.amount) {
        return parseFloat(price.amount).toFixed(2)
      }
    }

    return "0.00"
  } catch (error) {
    return "0.00"
  }
}

/**
 * Test if a video URL is valid and accessible
 */
export async function testVideoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return (
      response.ok && response.headers.get("content-type")?.includes("video")
    )
  } catch (error) {
    console.error("Error testing video URL:", error)
    return false
  }
}

/**
 * Check all product media for potential issues
 */
export function validateProductMedia(product: ShopifyProduct): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!product.media || product.media.length === 0) {
    issues.push("Product has no media")
    return { valid: false, issues }
  }

  // Check video media
  const videoMedia = product.media.filter((m) => m.mediaContentType === "VIDEO")
  if (videoMedia.length > 0) {
    videoMedia.forEach((media, index) => {
      if (!media.sources || media.sources.length === 0) {
        issues.push(`Video media #${index} has no sources`)
      } else if (!media.sources[0].url) {
        issues.push(`Video media #${index} has no URL in first source`)
      }

      if (!media.previewImage) {
        issues.push(`Video media #${index} has no preview image`)
      }
    })
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
