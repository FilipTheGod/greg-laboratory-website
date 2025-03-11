// src/components/debug/VideoDebug.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"

interface VideoDebugProps {
  videoUrl: string
  title: string
}

interface VideoMetadata {
  headers?: Record<string, string>
  duration?: number
  videoWidth?: number
  videoHeight?: number
}

const VideoDebug: React.FC<VideoDebugProps> = ({ videoUrl, title }) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [metadata, setMetadata] = useState<VideoMetadata>({})
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkVideo = async () => {
      try {
        // Try to fetch video headers
        const response = await fetch(videoUrl, { method: "HEAD" })

        if (!response.ok) {
          setStatus("error")
          setErrorMessage(
            `HTTP error: ${response.status} ${response.statusText}`
          )
          return
        }

        // Check content type
        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("video")) {
          setStatus("error")
          setErrorMessage(`Invalid content type: ${contentType}`)
          return
        }

        // Collect headers for debugging
        const headers: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          headers[key] = value
        })

        setMetadata({
          ...metadata,
          headers,
        })

        setStatus("success")
      } catch (error) {
        setStatus("error")
        setErrorMessage(
          `Network error: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }

    checkVideo()
  }, [videoUrl, metadata])

  // Handle video events
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const newMetadata = { ...metadata }

      if (videoRef.current.duration) {
        newMetadata.duration = videoRef.current.duration
      }

      if (videoRef.current.videoWidth) {
        newMetadata.videoWidth = videoRef.current.videoWidth
      }

      if (videoRef.current.videoHeight) {
        newMetadata.videoHeight = videoRef.current.videoHeight
      }

      setMetadata(newMetadata)
    }
  }

  const handleError = () => {
    setStatus("error")
    setErrorMessage(
      `Video element error: ${
        videoRef.current?.error?.message || "Unknown error"
      }`
    )
  }

  return (
    <div className="border p-4 mb-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="text-sm mb-2">
        Status:{" "}
        <span
          className={
            status === "success"
              ? "text-green-600"
              : status === "error"
              ? "text-red-600"
              : "text-blue-600"
          }
        >
          {status === "loading"
            ? "Checking..."
            : status === "success"
            ? "Video available"
            : "Error"}
        </span>
      </div>

      {status === "error" && (
        <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
      )}

      <div className="mb-4">
        <div className="text-xs mb-1">URL:</div>
        <div className="text-xs break-all bg-gray-100 p-2">{videoUrl}</div>
      </div>

      {status === "success" && (
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
            className="w-full h-full"
          >
            Your browser doesnt support HTML5 video.
          </video>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-1">Metadata:</h4>
        <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-40">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default VideoDebug
