// src/utils/video-finder.js

/**
 * This script helps map product handles to video filenames
 * It can be run on the client-side console to find the right mappings
 */

// Function to get all available videos from the /video folder
async function scanAvailableVideos() {
  try {
    console.log("Scanning for available videos...")

    // Simulate scanning through DOM for video elements
    // In a real implementation, you might need to use the Fetch API
    // to list the contents of the /video directory if your server supports it

    // For now, we'll hardcode the videos that we know exist
    const knownVideos = [
      "Greg Jacket 2.0.mp4",
      "Greg Jacket.mp4",
      "Greg Laboratory PC-FS-T24.mp4",
      "Greg Laboratory PC-SS-LS24.mp4",
      "Greg Laboratory PC-SS-P23.mp4",
      "Greg Laboratory PC-SS-P23 (1).mp4",
      "Greg Laboratory Quarter Zip Crew.mp4",
      "PC-TS-Q24 Quarter Zip.mp4",
    ]

    console.log("Available videos:")
    knownVideos.forEach((video) => console.log(`- ${video}`))

    return knownVideos
  } catch (error) {
    console.error("Error scanning videos:", error)
    return []
  }
}

// Function to find the best matching video for a product handle
function findBestMatchingVideo(productHandle, videosList) {
  console.log(`Finding best match for product: ${productHandle}`)

  // Convert handles to different formats for matching
  const normalizedHandle = productHandle.toLowerCase().replace(/-/g, " ")
  const parts = productHandle.split("-")

  // Try different matching strategies

  // 1. Exact match
  const exactMatch = videosList.find((v) =>
    v.toLowerCase().includes(productHandle.toLowerCase())
  )

  if (exactMatch) {
    console.log(`✅ Found exact match: ${exactMatch}`)
    return exactMatch
  }

  // 2. Normalized match (spaces instead of dashes)
  const normalizedMatch = videosList.find((v) =>
    v.toLowerCase().includes(normalizedHandle)
  )

  if (normalizedMatch) {
    console.log(`✅ Found normalized match: ${normalizedMatch}`)
    return normalizedMatch
  }

  // 3. Try to match parts of the handle
  for (const part of parts) {
    if (part.length < 3) continue // Skip very short parts

    const partialMatch = videosList.find((v) =>
      v.toLowerCase().includes(part.toLowerCase())
    )

    if (partialMatch) {
      console.log(`✅ Found partial match with "${part}": ${partialMatch}`)
      return partialMatch
    }
  }

  console.log("❌ No match found")
  return null
}

// Helper function to generate the video-utils.ts mapping
async function generateVideoMapping() {
  const videos = await scanAvailableVideos()

  // Example product handles to map
  const productHandles = [
    "jacket-2",
    "jacket",
    "pc-fs-t24",
    "ss-ls24",
    "ss-p23",
    "quarter-zip",
    "ts-q24",
  ]

  console.log("\nGenerating video mapping...")
  console.log("const VIDEO_MAPPING: Record<string, string> = {")

  for (const handle of productHandles) {
    const match = findBestMatchingVideo(handle, videos)
    if (match) {
      console.log(`  '${handle}': '${match}',`)
    }
  }

  console.log("  // Add more mappings as needed")
  console.log("};")
}

// To use this in the browser console:
// 1. Copy this entire file
// 2. Paste it in the browser console
// 3. Call generateVideoMapping()
