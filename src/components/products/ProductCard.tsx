// src/components/products/ProductCard.tsx
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"

// Define interfaces for API response
interface MediaNode {
  id: string
  mediaContentType: string
  sources?: {
    format: string
    mimeType: string
    url: string
  }[]
  preview?: {
    image?: {
      url: string
    }
  }
}

interface MediaEdge {
  node: MediaNode
}

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Remove videoLoaded if not used
  const [videoError, setVideoError] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  // Handle video error for dependency array
  const handleVideoError = React.useCallback(() => {
    console.error(`Video error for product ${product.title}`)
    setVideoError(true)
  }, [product.title])

  // Fetch media from Admin API
  useEffect(() => {
    const fetchMedia = async () => {
      if (!product.handle) return

      setIsLoadingMedia(true)
      try {
        const response = await fetch(`/api/products/media/${product.handle}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Media API response:", data)

          // Check if we have video media
          const productData = data.data?.productByHandle
          if (productData?.media?.edges) {
            const videoEdge = productData.media.edges.find(
              (edge: MediaEdge) => edge.node.mediaContentType === "VIDEO"
            )

            if (videoEdge?.node?.sources?.[0]?.url) {
              setVideoUrl(videoEdge.node.sources[0].url)
              if (videoEdge.node.preview?.image?.url) {
                setPreviewImage(videoEdge.node.preview.image.url)
              }
              console.log("Found video for product:", product.handle)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product media:", error)
      } finally {
        setIsLoadingMedia(false)
      }
    }

    fetchMedia()
  }, [product.handle])

  // Initialize video element after component mounts
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // Set up event handlers for debugging
      videoRef.current.onerror = handleVideoError

      // Force reload the video element to ensure it plays
      videoRef.current.load()
    }
  }, [videoUrl, handleVideoError])

  return (
    <Link href={`/product/${product.handle}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-laboratory-white mb-2">
        {videoUrl && !videoError ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            poster={previewImage || undefined}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].src}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-500"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
            <span className="text-laboratory-black/30 text-medium tracking-wide">
              No Image
            </span>
          </div>
        )}

        {isLoadingMedia && (
          <div className="absolute inset-0 flex items-center justify-center bg-laboratory-black/10">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-laboratory-black/70 text-regular tracking-wide uppercase">
            {product.productType}
          </h3>
          <h2 className="text-laboratory-black text-medium tracking-wide uppercase">
            {product.title}
          </h2>
        </div>
        <p className="text-laboratory-black text-medium tracking-wide">
          ${formatPrice(product.variants[0]?.price)}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
