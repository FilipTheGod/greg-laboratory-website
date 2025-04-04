// src/components/products/ProductMedia.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"

interface ProductMediaProps {
  product: ShopifyProduct
  priority?: boolean
  className?: string
}

/**
 * ProductMedia component that shows videos on product grid
 * Uses direct CDN URLs based on product handle
 */
const ProductMedia: React.FC<ProductMediaProps> = ({
  product,
  priority = false,
  className = "w-full h-full object-cover",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Try to get the video URL for the product
  useEffect(() => {
    // Reset states
    setVideoError(false)
    setVideoLoaded(false)

    // Construct a video URL based on pattern from your existing site
    try {
      // Based on your network tab screenshot showing proper domain and pattern
      const videoUrl = `https://greglaboratory.com/cdn/shop/videos/c/vp/${product.handle}/${product.handle}-HD-720p-1.6Mbps-3913547.mp4?v=0`;
      setVideoUrl(videoUrl);
      console.log(`Trying video URL: ${videoUrl}`);
    } catch (err) {
      console.error("Error constructing video URL:", err);
      setVideoError(true);
    }
  }, [product.handle]);

  // Handle video loading
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      console.log(`Video loaded for ${product.handle}`);
    };

    const handleError = () => {
      console.log(`Video error for ${product.handle} - falling back to image`);
      setVideoError(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Try to load the video
    video.load();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [videoUrl, product.handle]);

  // If video failed to load or we don't have a URL, fall back to image
  if (videoError || !videoUrl) {
    // Show first product image
    if (product.images && product.images.length > 0) {
      return (
        <Image
          src={product.images[0].src}
          alt={product.title}
          fill
          className={className}
          priority={priority}
        />
      );
    }

    // Fallback for no images
    return (
      <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
        <span className="text-laboratory-black/30 text-xs tracking-wide">
          No Image
        </span>
      </div>
    );
  }

  // Return video with image fallback while loading
  return (
    <>
      {/* Show image while video is loading */}
      {!videoLoaded && product.images && product.images.length > 0 && (
        <Image
          src={product.images[0].src}
          alt={product.title}
          fill
          className={className}
          priority={priority}
        />
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`${className} ${videoLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        poster={product.images && product.images.length > 0 ? product.images[0].src : undefined}
        onError={() => setVideoError(true)}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>
  );
};

export default ProductMedia;