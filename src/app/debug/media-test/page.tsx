// src/app/debug/media-test/page.tsx
"use client"

import { useState } from "react"

// Define types for the media data
interface MediaSource {
  format: string
  mimeType: string
  url: string
}

interface MediaPreviewImage {
  url: string
  altText?: string
}

interface MediaNode {
  id: string
  mediaContentType: string
  sources?: MediaSource[]
  preview?: {
    image?: MediaPreviewImage
  }
  image?: {
    url: string
    altText?: string
  }
}

interface MediaEdge {
  node: MediaNode
}

interface MediaData {
  data?: {
    productByHandle?: {
      id: string
      title: string
      handle: string
      media?: {
        edges: MediaEdge[]
      }
    }
  }
  errors?: any[]
}

export default function MediaTest() {
  const [handle, setHandle] = useState("")
  const [mediaData, setMediaData] = useState<MediaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchMedia = async () => {
    if (!handle) {
      setError("Please enter a product handle")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/media/${handle}`)
      const data = await response.json()

      setMediaData(data)
      console.log("Media data:", data)
    } catch (err) {
      setError("Failed to fetch media data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Media Test Page</h1>

      <div className="mb-6">
        <label className="block mb-2">Product Handle:</label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="border p-2 w-full max-w-md"
          placeholder="e.g. pc-ss-p23-black"
        />
        <button
          onClick={handleFetchMedia}
          className="mt-2 bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={isLoading || !handle}
        >
          {isLoading ? "Loading..." : "Fetch Media"}
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700">{error}</div>}

      {mediaData && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Media Results</h2>

          {mediaData.data?.productByHandle ? (
            <>
              <h3 className="text-lg font-semibold">
                {mediaData.data.productByHandle.title}
              </h3>

              {mediaData.data.productByHandle.media?.edges?.length > 0 ? (
                <div className="mt-4 space-y-6">
                  <p className="text-green-600">
                    Found {mediaData.data.productByHandle.media.edges.length}{" "}
                    media items
                  </p>

                  {mediaData.data.productByHandle.media.edges.map(
                    (edge, index) => (
                      <div key={edge.node.id} className="p-4 border rounded">
                        <p className="font-semibold mb-2">
                          Media Item #{index + 1} - Type:{" "}
                          {edge.node.mediaContentType}
                        </p>

                        {edge.node.mediaContentType === "VIDEO" && (
                          <div>
                            <p className="mb-2">Video Sources:</p>
                            {edge.node.sources?.map((source, sourceIndex) => (
                              <div key={sourceIndex} className="mb-4">
                                <p>
                                  Format: {source.format}, MIME:{" "}
                                  {source.mimeType}
                                </p>
                                <p className="mb-2 break-words">
                                  URL: {source.url}
                                </p>

                                <video
                                  controls
                                  className="w-full max-w-md bg-black"
                                  poster={edge.node.preview?.image?.url}
                                >
                                  <source
                                    src={source.url}
                                    type={source.mimeType}
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            ))}
                          </div>
                        )}

                        {edge.node.mediaContentType === "IMAGE" &&
                          edge.node.image && (
                            <div>
                              <p className="mb-2">Image:</p>
                              {/* Use Next.js Image component */}
                              <img
                                src={edge.node.image.url}
                                alt={edge.node.image.altText || "Product image"}
                                className="max-w-md"
                              />
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-4 text-yellow-600">
                  No media found for this product.
                </p>
              )}
            </>
          ) : (
            <pre className="p-4 bg-gray-100 overflow-auto">
              {JSON.stringify(mediaData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
