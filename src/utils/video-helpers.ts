// src/utils/video-helpers.ts

/**
 * Helper functions for working with video sources
 */

/**
 * Gets the best MP4 video source URL from a list of sources
 * Prioritizes lower resolution sources for mobile performance
 *
 * @param sources Array of video sources
 * @param preferMobile Whether to prioritize mobile-friendly sources
 * @returns The best MP4 source URL or null if none found
 */
export function getBestVideoSource(
  sources: Array<{ url: string, mimeType: string, format?: string }> | undefined,
  preferMobile = false
): string | null {
  if (!sources || sources.length === 0) return null;

  // For mobile, prioritize lower resolution versions
  if (preferMobile) {
    // Look for SD or lower resolution MP4
    const mobileFriendlySource = sources.find(
      (s) =>
        s.mimeType === "video/mp4" &&
        (s.url.includes("SD") ||
         s.url.includes("480p") ||
         s.url.includes("360p") ||
         s.url.includes("low"))
    );

    if (mobileFriendlySource) return mobileFriendlySource.url;
  }

  // If no mobile source or not prioritizing mobile, look for any MP4
  const mp4Source = sources.find(s => s.mimeType === "video/mp4");
  if (mp4Source) return mp4Source.url;

  // Fallback to any video source if no MP4
  return sources[0]?.url || null;
}

/**
 * Checks if the user agent suggests a mobile device
 * @returns boolean indicating if the device is likely mobile
 */
export function isMobileDevice(): boolean {
  // Only run on client
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

/**
 * Forces a video element to play and handles errors appropriately
 * @param videoElement The video element to play
 * @param showControlsOnFail Whether to show controls if autoplay fails
 * @returns Promise that resolves to success status
 */
export async function forceVideoPlay(
  videoElement: HTMLVideoElement,
  showControlsOnFail = true
): Promise<boolean> {
  if (!videoElement) return false;

  try {
    // Configure for best autoplay chances
    videoElement.muted = true;
    videoElement.playsInline = true;

    // Attempt to play
    await videoElement.play();
    return true;
  } catch (error) {
    console.log("Autoplay failed:", error);

    // Show controls if autoplay fails and option is enabled
    if (showControlsOnFail) {
      videoElement.controls = true;
    }

    return false;
  }
}