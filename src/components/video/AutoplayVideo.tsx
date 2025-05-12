// src/components/video/AutoplayVideo.tsx
"use client"

import React, { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { useMobileDetect } from "@/hooks/useMediaQuery"

interface AutoplayVideoProps {
  src: string | null
  poster?: string | null
  className?: string
  alt?: string
  fallbackImage?: string
}

/**
 * A component that handles video autoplay with proper mobile support
 */
const AutoplayVideo: React.FC<AutoplayVideoProps> = ({
  src,
  poster,
  className = "",
  alt = "Product video",
  fallbackImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const isMobile = useMobileDetect()
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    if (!videoRef.current || !src) return

    const videoElement = videoRef.current

    // Reset error state when src changes
    setVideoError(false)

    // Configure video for best autoplay chance on all devices
    videoElement.muted = true
    videoElement.playsInline = true
    videoElement.loop = true

    // Add playsinline attribute directly (for older iOS)
    videoElement.setAttribute("playsinline", "true")
    videoElement.setAttribute("webkit-playsinline", "true")

    const attemptPlay = () => {
      videoElement.play().catch((error) => {
        console.log("Autoplay failed:", error)

        // On mobile, show controls when autoplay fails
        if (isMobile) {
          videoElement.controls = true
        }

        // If it's a real error (not just autoplay restrictions)
        if (error.name !== "NotAllowedError") {
          setVideoError(true)
        }
      })
    }

    // Attempt play once video can play through
    const handleCanPlayThrough = () => {
      attemptPlay()
    }

    // Handle loading errors
    const handleError = () => {
      console.error("Video loading error")
      setVideoError(true)
    }

    // Add event listeners
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough)
    videoElement.addEventListener("error", handleError)

    // Try immediate play (will likely succeed on desktop, some mobile)
    if (videoElement.readyState >= 3) {
      // HAVE_FUTURE_DATA or higher
      attemptPlay()
    }

    // Cleanup function
    return () => {
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough)
      videoElement.removeEventListener("error", handleError)

      // Pause video on unmount to free resources
      if (!videoElement.paused) {
        videoElement.pause()
      }
    }
  }, [src, isMobile])

  // Handle user interaction to trigger play on mobile
  const handleTouch = () => {
    if (isMobile && videoRef.current && !isTouched) {
      const videoElement = videoRef.current

      if (videoElement.paused) {
        videoElement
          .play()
          .catch((err) => console.log("Play on touch failed:", err))
      }

      setIsTouched(true)

      // Remove controls after successful user interaction
      setTimeout(() => {
        if (videoElement && !videoElement.paused) {
          videoElement.controls = false
        }
      }, 1000)
    }
  }

  // If there's an error or no source, show fallback image
  if (videoError || !src) {
    if (fallbackImage) {
      return (
        <div className={`${className} relative overflow-hidden`}>
          <Image src={fallbackImage} alt={alt} fill className="object-cover" />
        </div>
      )
    }
    return null
  }

  return (
    <video
      ref={videoRef}
      className={`${className} object-cover`}
      poster={poster || undefined}
      muted
      loop
      playsInline
      onClick={handleTouch}
      onTouchStart={handleTouch}
      preload="auto"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

export default AutoplayVideo
