// src/app/api/products/media/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getProductByHandle } from "@/lib/shopify"

export async function GET(
  _: NextRequest, // Using underscore to indicate we're not using this parameter
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const resolvedParams = await params
    const handle = resolvedParams.handle

    console.log("Fetching media for product:", handle)

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      )
    }

    // Fetch the product to get its media
    const product = await getProductByHandle(handle)
    // console.log("Product media found:", product?.media)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Extract video media if available
    const videoMedia = product.media?.find(
      (media) => media.mediaContentType === "VIDEO"
    )

    console.log("Video media found:", videoMedia)

    // If there's no video media, return an empty response
    if (!videoMedia) {
      return NextResponse.json({
        data: {
          hasVideo: false,
          sources: [],
          previewImage: null,
        },
      })
    }

    // Return the video media data
    return NextResponse.json({
      data: {
        hasVideo: true,
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