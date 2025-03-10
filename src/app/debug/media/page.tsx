// src/app/debug/media/page.tsx
import React from "react"
import { getAllProducts } from "@/lib/shopify"
import VideoDebugClient from "./video-debug-client"

// This is a server component that fetches all products
export default async function MediaDebugPage() {
  // Only available in development
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Debug Page</h1>
        <p>This page is only available in development mode.</p>
      </div>
    )
  }

  try {
    const products = await getAllProducts()

    // Count products with video media
    const productsWithVideo = products.filter(
      (p) =>
        p.media &&
        p.media.length > 0 &&
        p.media.some((m) => m.mediaContentType === "VIDEO")
    )

    // Extract video URLs for each product with video
    const productVideos = productsWithVideo.map((product) => {
      // Find all video media items
      const videoMedia =
        product.media?.filter((m) => m.mediaContentType === "VIDEO") || []

      // Extract video sources
      const videos = videoMedia.map((media) => {
        return {
          productId: product.id,
          productTitle: product.title,
          productHandle: product.handle,
          mediaId: media.id,
          sourceUrls: media.sources?.map((s) => s.url) || [],
          hasPreviewImage: !!media.previewImage,
          previewImageSrc: media.previewImage?.src,
        }
      })

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        videos,
      }
    })

    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Media Debug Page</h1>

        <div className="mb-6">
          <h2 className="text-xl mb-2">Summary</h2>
          <ul className="list-disc pl-5">
            <li>Total products: {products.length}</li>
            <li>Products with video: {productsWithVideo.length}</li>
            <li>
              Total video media items:{" "}
              {productVideos.reduce((acc, p) => acc + p.videos.length, 0)}
            </li>
          </ul>
        </div>

        {/* Pass the extracted videos to the client component */}
        <VideoDebugClient productVideos={productVideos} />
      </div>
    )
  } catch (error) {
    console.error("Error in Media Debug Page:", error)

    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Media Debug Page</h1>
        <p className="text-red-600">
          Error loading products:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    )
  }
}
