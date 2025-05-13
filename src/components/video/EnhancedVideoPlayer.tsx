// src/components/video/EnhancedVideoPlayer.tsx
"use client"

import React, { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { useMobileDetect } from "@/hooks/useMediaQuery"
import { getBestVideoSource } from "@/utils/video-helpers"

interface EnhancedVideoPlayerProps {
  sources?: Array<{ url: string; mimeType: string; format?: string }>
  videoUrl?: string // Direct URL alternative to sources
  poster?: string | null
  className?: string
  alt?: string
  fallbackImageUrl?: string
  loop?: boolean
  showPlayButton?: boolean
  onError?: () => void
  preventClickPropagation?: boolean // Add this prop
}

/**
 * Enhanced video component with proper mobile support and autoplay handling
 * Modified to allow clicks to propagate to parent elements (for navigation)
 */
const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  sources,
  videoUrl,
  poster,
  className = "",
  alt = "Video",
  fallbackImageUrl,
  loop = true,
  showPlayButton = true,
  onError,
  preventClickPropagation = false, // Default to false to allow click propagation
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const isMobile = useMobileDetect()

  // Determine the best video source URL
  const actualVideoUrl = sources
    ? getBestVideoSource(sources, isMobile)
    : videoUrl || null

  useEffect(() => {
    if (!videoRef.current || !actualVideoUrl) return

    const videoElement = videoRef.current
    setVideoError(false)

    // Configure video for best autoplay chance
    videoElement.muted = true
    videoElement.playsInline = true
    videoElement.loop = loop
    videoElement.autoplay = true // Force autoplay

    // Add playsinline attribute for iOS Safari
    videoElement.setAttribute("playsinline", "true")
    videoElement.setAttribute("webkit-playsinline", "true")
    videoElement.setAttribute("autoplay", "true") // Additional attribute for older browsers

    // Create a more aggressive approach to ensure autoplay
    const attemptAutoplay = () => {
      const playPromise = videoElement.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            console.log("Autoplay successful")
          })
          .catch((error) => {
            console.log("Initial autoplay failed:", error)

            // Try again with a slight delay
            setTimeout(() => {
              console.log("Retrying autoplay...")
              videoElement
                .play()
                .then(() => {
                  setIsPlaying(true)
                  console.log("Delayed autoplay successful")
                })
                .catch((retryError) => {
                  console.log("Retry autoplay failed:", retryError)
                  if (isMobile) {
                    setShowControls(true)
                  }

                  // Only set real errors, not autoplay restrictions
                  if (retryError.name !== "NotAllowedError") {
                    setVideoError(true)
                    if (onError) onError()
                  }
                })
            }, 500)
          })
      }
    }

    // Event listeners
    const handleCanPlay = () => attemptAutoplay()
    const handleLoadError = () => {
      console.error("Video loading error")
      setVideoError(true)
      if (onError) onError()
    }

    // Add event listeners
    videoElement.addEventListener("canplay", handleCanPlay)
    videoElement.addEventListener("loadedmetadata", handleCanPlay)
    videoElement.addEventListener("error", handleLoadError)

    // Try playing if video is already loaded
    if (videoElement.readyState >= 2) {
      attemptAutoplay()
    }

    // Create visibility observer to pause when off-screen and resume when back
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoElement) return

          if (entry.isIntersecting) {
            if (videoElement.paused) {
              videoElement
                .play()
                .catch((err) => console.log("Resume play failed:", err))
            }
          } else if (!videoElement.paused) {
            videoElement.pause()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(videoElement)

    // Cleanup
    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay)
      videoElement.removeEventListener("loadedmetadata", handleCanPlay)
      videoElement.removeEventListener("error", handleLoadError)
      observer.disconnect()

      if (!videoElement.paused) {
        videoElement.pause()
      }
    }
  }, [actualVideoUrl, isMobile, loop, onError])

  // Handle user touch/click to play video (helps on mobile)
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Only stop propagation if explicitly requested
    if (preventClickPropagation) {
      e.stopPropagation()
    }

    if (!videoRef.current) return

    const videoElement = videoRef.current

    if (videoElement.paused) {
      // Try to play and hide controls if successful
      videoElement
        .play()
        .then(() => {
          setIsPlaying(true)
          // Hide controls after successful play
          setTimeout(() => {
            if (!videoElement.paused) {
              setShowControls(false)
            }
          }, 1500)
        })
        .catch((err) => {
          console.log("Play on interaction failed:", err)
          // Keep controls visible if play fails
          setShowControls(true)
        })
    } else {
      // Don't pause on click - this lets clicks go through to parent links
      // videoElement.pause()
      // setIsPlaying(false)
    }
  }

  // If there's an error or no source, show fallback image
  if (videoError || !actualVideoUrl) {
    if (fallbackImageUrl) {
      return (
        <div className={`${className} relative overflow-hidden`}>
          <Image
            src={fallbackImageUrl}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-contain" // Changed to object-contain to maintain aspect ratio
        poster={poster || undefined}
        muted
        loop={loop}
        playsInline
        autoPlay
        controls={showControls}
        onClick={handleInteraction}
        onTouchStart={isMobile ? handleInteraction : undefined}
        // Add pointer-events-none to allow clicks to pass through to parent elements
        style={{ pointerEvents: 'none' }}
      >
        <source src={actualVideoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play button overlay - now with pointer-events-none to allow clicks to pass through */}
      {isMobile && !isPlaying && showPlayButton && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer pointer-events-none"
        >
          <div className="rounded-full bg-white/80 p-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-black"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedVideoPlayer