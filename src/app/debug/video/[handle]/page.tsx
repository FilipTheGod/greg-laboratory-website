// src/app/debug/video-debug/page.tsx
"use client"

import { useState } from "react"
import { getProductByHandle } from "@/lib/shopify"
import { ShopifyProduct } from "@/lib/shopify"
import Image from "next/image"

export default function SimpleVideoDebugPage() {
  const [productHandle, setProductHandle] = useState("")
  const [product, setProduct] = useState<ShopifyProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  const fetchProduct = async () => {
    if (!productHandle.trim()) {
      setError("Please enter a product handle")
      return
    }

    setLoading(true)
    setError(null)
    setProduct(null)
    setVideoUrl(null)
    setPosterUrl(null)
    setVideoError(null)

    try {
      const fetchedProduct = await getProductByHandle(productHandle)

      if (!fetchedProduct) {
        setError(`No product found with handle: ${productHandle}`)
        setLoading(false)
        return
      }

      setProduct(fetchedProduct)

      // Check for video media
      const videoMedia = fetchedProduct.media?.find(
        (media) => media.mediaContentType === "VIDEO"
      )

      if (videoMedia && videoMedia.sources && videoMedia.sources.length > 0) {
        setVideoUrl(videoMedia.sources[0].url)

        if (videoMedia.previewImage && videoMedia.previewImage.src) {
          setPosterUrl(videoMedia.previewImage.src)
        }
      }
    } catch (err) {
      setError(
        `Error fetching product: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.currentTarget
    setVideoError(`Video error: ${videoEl.error?.message || "Unknown error"}`)
  }

  const clearCache = () => {
    if (!productHandle) return

    try {
      const cacheKey = `product_media_${productHandle}`
      localStorage.removeItem(cacheKey)
      alert(`Cache cleared for ${productHandle}`)
    } catch (err) {
      console.error("Error clearing cache:", err)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Video Debug Tool</h1>

      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={productHandle}
            onChange={(e) => setProductHandle(e.target.value)}
            placeholder="Enter product handle (e.g. black-half-zip)"
            className="flex-1 border px-3 py-2 rounded"
          />
          <button
            onClick={fetchProduct}
            disabled={loading || !productHandle.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Debug"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}
      </div>

      {product && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">{product.title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Product Info</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium pr-4 py-1">Handle:</td>
                    <td>{product.handle}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4 py-1">ID:</td>
                    <td>{product.id}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4 py-1">Type:</td>
                    <td>{product.productType}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4 py-1">Total Media:</td>
                    <td>{product.media?.length || 0} items</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4 py-1">Images:</td>
                    <td>{product.images?.length || 0} images</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Media Details</h3>

              {product.media && product.media.length > 0 ? (
                <div>
                  {product.media.map((media, index) => (
                    <div
                      key={media.id}
                      className="mb-2 p-2 bg-white rounded border"
                    >
                      <p>
                        Media #{index + 1}: {media.mediaContentType}
                      </p>
                      {media.mediaContentType === "VIDEO" && (
                        <>
                          <p className="text-xs text-gray-500 truncate">
                            Sources: {media.sources?.length || 0}
                          </p>
                          {media.sources && media.sources.length > 0 && (
                            <p className="text-xs text-gray-500 truncate">
                              URL: {media.sources[0].url}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No media items found</p>
              )}
            </div>
          </div>

          {videoUrl && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Video Test</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-video bg-black rounded overflow-hidden">
                  <video
                    src={videoUrl}
                    poster={posterUrl || undefined}
                    controls
                    className="w-full h-full object-contain"
                    onError={handleVideoError}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/quicktime" />
                    Your browser doesn&apos;t support HTML5 video.
                  </video>
                </div>

                <div>
                  <div className="bg-white p-3 rounded border mb-3">
                    <p className="font-medium">Video URL:</p>
                    <p className="text-xs break-all text-blue-600">
                      {videoUrl}
                    </p>

                    {posterUrl && (
                      <>
                        <p className="font-medium mt-2">Poster Image:</p>
                        <p className="text-xs break-all text-blue-600">
                          {posterUrl}
                        </p>
                      </>
                    )}

                    {videoError && (
                      <p className="text-red-500 mt-2">{videoError}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={clearCache}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Clear Cache
                    </button>

                    <button
                      onClick={() => window.open(videoUrl, "_blank")}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Open Video URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-3">First Image</h3>
            {product.images && product.images.length > 0 ? (
              <div className="w-48 h-48 relative">
                <Image
                  src={product.images[0].src}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <p>No images available</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">
          Common Solutions for Video Issues:
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            MOV files may not work in all browsers - convert to MP4 if possible
          </li>
          <li>Ensure the video file size is reasonable (under 20MB)</li>
          <li>Check CORS settings in Shopify</li>
          <li>
            Try using Chrome or Safari which have better support for various
            video formats
          </li>
          <li>
            Check browser console for any network errors related to video
            loading
          </li>
        </ul>
      </div>
    </div>
  )
}
