// src/app/api/products/media/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getProductByHandle } from "@/lib/shopify"

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } | Promise<{ handle: string }> }
) {
  try {
    // Ensure params is awaited before using its properties
    const resolvedParams = params instanceof Promise ? await params : params
    const handle = resolvedParams?.handle

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      )
    }

    // Fetch the product to get its media
    const product = await getProductByHandle(handle)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Extract video media if available
    const videoMedia = product.media?.find(
      (media) => media.mediaContentType === "VIDEO"
    )

    // If there's no video media, return an empty response
    if (!videoMedia) {
      return NextResponse.json({ data: { hasVideo: false } })
    }

    // Return the video media data
    return NextResponse.json({
      data: {
        hasVideo: true,
        mediaId: videoMedia.id,
        mediaContentType: videoMedia.mediaContentType,
        sources: videoMedia.sources || [],
        previewImage: videoMedia.previewImage || null,
      },
    })
  } catch (error) {
    console.error("Error fetching product media:", error)
    return NextResponse.json(
      { error: "Failed to fetch product media" },
      { status: 500 }
    )
  }
}
