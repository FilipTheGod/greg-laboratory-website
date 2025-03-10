// src/app/debug/media/video-debug-client.tsx
"use client"

import React, { useState } from "react"
import Image from "next/image"
import VideoDebug from "@/components/debug/VideoDebug"

interface VideoSource {
  productId: string
  productTitle: string
  productHandle: string
  mediaId: string
  sourceUrls: string[]
  hasPreviewImage: boolean
  previewImageSrc?: string
}

interface ProductVideo {
  id: string
  title: string
  handle: string
  videos: VideoSource[]
}

interface VideoDebugClientProps {
  productVideos: ProductVideo[]
}

export default function VideoDebugClient({
  productVideos,
}: VideoDebugClientProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  // Toggle expansion state for a product
  const toggleExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId)
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Products with Video Media</h2>

      {productVideos.length === 0 ? (
        <p className="text-gray-500">No products with video media found.</p>
      ) : (
        <div className="space-y-6">
          {productVideos.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <button
                className="flex justify-between items-center w-full text-left font-medium"
                onClick={() => toggleExpand(product.id)}
              >
                <span>
                  {product.title} ({product.videos.length} video
                  {product.videos.length !== 1 ? "s" : ""})
                </span>
                <span>{expandedProduct === product.id ? "−" : "+"}</span>
              </button>

              {expandedProduct === product.id && (
                <div className="mt-4 space-y-6">
                  {product.videos.map((videoSource, videoIndex) => (
                    <div
                      key={videoSource.mediaId}
                      className="pl-4 border-l-2 border-gray-300"
                    >
                      <h3 className="font-medium mb-2">
                        Video {videoIndex + 1}
                      </h3>

                      <div className="mb-2 text-sm">
                        <p>Media ID: {videoSource.mediaId}</p>
                        <p>
                          Has preview image:{" "}
                          {videoSource.hasPreviewImage ? "Yes" : "No"}
                        </p>
                        <p>Source URLs: {videoSource.sourceUrls.length}</p>
                      </div>

                      {videoSource.hasPreviewImage &&
                        videoSource.previewImageSrc && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">
                              Preview Image:
                            </h4>
                            <div className="relative w-40 h-40 bg-gray-100">
                              <Image
                                src={videoSource.previewImageSrc}
                                alt={`Preview for ${product.title}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}

                      {videoSource.sourceUrls.length > 0 ? (
                        <div className="space-y-4">
                          {videoSource.sourceUrls.map((url, urlIndex) => (
                            <VideoDebug
                              key={urlIndex}
                              videoUrl={url}
                              title={`Source ${urlIndex + 1}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-red-600 text-sm">
                          No video source URLs found for this media item.
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-medium mb-2">Product Info</h3>
                    <div className="text-sm">
                      <p>ID: {product.id}</p>
                      <p>Handle: {product.handle}</p>
                      <p>
                        Product page:{" "}
                        <a
                          href={`/product/${product.handle}`}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          View Product
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
