// src/hooks/useMediaQuery.ts
import { useState, useEffect } from "react"

/**
 * A custom hook to detect if the viewport matches a media query
 * @param query The media query to check against
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Set initial value on client-side (not during SSR)
    if (typeof window !== "undefined") {
      setMatches(window.matchMedia(query).matches)
    }

    // Watch for changes
    const media = window.matchMedia(query)
    setMatches(media.matches)

    // Add listener
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    // Clean up
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

/**
 * A hook to detect if the current device is a mobile device
 * @returns Boolean indicating if the current device is mobile
 */
export function useMobileDetect(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check if user agent suggests mobile
      const ua = navigator.userAgent
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      // Also check viewport width as a fallback
      const isMobileViewport = window.innerWidth < 768

      setIsMobile(mobileRegex.test(ua) || isMobileViewport)
    }

    // Run on mount
    checkMobile()

    // Add resize listener (in case of rotation/resize)
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
