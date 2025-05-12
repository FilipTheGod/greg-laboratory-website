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
}

/**
 * Enhanced video component with proper mobile support and autoplay handling
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
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const isMobile = useMobileDetect()

  // Determine the best video source URL
  const actualVideoUrl = sources ? getBestVideoSource(sources, isMobile) : videoUrl || null

  useEffect(() => {
    if (!videoRef.current || !actualVideoUrl) return

    const videoElement = videoRef.current
    setVideoError(false)

    // Configure video for best autoplay chance
    videoElement.muted = true
    videoElement.playsInline = true
    videoElement.loop = loop

    // Add playsinline attribute for iOS Safari
    videoElement.setAttribute("playsinline", "true")
    videoElement.setAttribute("webkit-playsinline", "true")

    // If autoplay fails, this will show controls on mobile
    const handleAutoplayFail = (error: Error) => {
      console.log("Autoplay failed:", error)
      if (isMobile) {
        setShowControls(true)
      }
      // Don't set videoError for autoplay restrictions
      if (error.name !== "NotAllowedError") {
        setVideoError(true)
        if (onError) onError()
      }
    }

    // Attempt to play when video is ready
    const attemptPlay = () => {
      videoElement
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(handleAutoplayFail)
    }

    // Event listeners
    const handleCanPlay = () => {
      attemptPlay()
    }

    const handleLoadError = () => {
      console.error("Video loading error")
      setVideoError(true)
      if (onError) onError()
    }

    // Add event listeners
    videoElement.addEventListener("canplay", handleCanPlay)
    videoElement.addEventListener("error", handleLoadError)

    // Try playing if video is already loaded
    if (videoElement.readyState >= 3) {
      attemptPlay()
    }

    // Create visibility observer to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoElement || videoElement.paused) return

          if (!entry.isIntersecting) {
            videoElement.pause()
          } else if (isPlaying) {
            videoElement.play().catch(err => console.log("Resume play failed:", err))
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(videoElement)

    // Cleanup
    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay)
      videoElement.removeEventListener("error", handleLoadError)
      observer.disconnect()

      if (!videoElement.paused) {
        videoElement.pause()
      }
    }
  }, [actualVideoUrl, isMobile, isPlaying, loop, onError])

  // Handle user touch/click to play video (helps on mobile)
  const handleInteraction = () => {
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
      videoElement.pause()
      setIsPlaying(false)
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
        className="h-full w-full object-cover"
        poster={poster || undefined}
        muted
        loop={loop}
        playsInline
        controls={showControls}
        onClick={handleInteraction}
        onTouchStart={isMobile ? handleInteraction : undefined}
      >
        <source src={actualVideoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play button overlay for mobile - shown when video is paused and showPlayButton is true */}
      {isMobile && !isPlaying && showPlayButton && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={handleInteraction}
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