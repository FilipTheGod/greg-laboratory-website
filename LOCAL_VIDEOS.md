# Local Video Integration Guide

This document explains how we've implemented local video files for product display on the Greg Laboratory website.

## Overview

Instead of relying on Shopify's media which was causing issues, we've implemented a solution using locally stored video files in the `/public/video` directory. The implementation includes:

1. A mapping system to match product handles to video filenames
2. A fallback mechanism to use product images when videos aren't available
3. Video autoplay on product cards with smooth transitions
4. Video controls on the product detail page

## Video Files

Videos are stored in the `/public/video` directory and should follow a consistent naming pattern that makes it easy to map to products:

```
public/
  └── video/
      ├── Greg Jacket 2.0.mp4
      ├── Greg Jacket.mp4
      ├── Greg Laboratory PC-FS-T24.mp4
      └── ...
```

## Video Mapping

In `src/utils/video-utils.ts`, we maintain a mapping between product handles and video filenames:

```typescript
const VIDEO_MAPPING: Record<string, string> = {
  'jacket-2': 'Greg Jacket 2.0.mp4',
  'jacket': 'Greg Jacket.mp4',
  'pc-fs-t24': 'Greg Laboratory PC-FS-T24.mp4',
  // Add more mappings as needed
};
```

When you add new videos, add a new mapping for the corresponding product handle.

## Adding New Videos

To add a new video:

1. Add the video file to `/public/video/`
2. Add the mapping in `src/utils/video-utils.ts`
3. Test the product page to ensure the video loads correctly

Video formats:
- Use MP4 format for best compatibility
- Keep video files under 5MB if possible
- Recommended dimensions: 1080x1080px
- Recommended duration: 5-10 seconds (they loop automatically)

## Helper Tools

A helper script `src/utils/video-finder.js` is provided to help map videos to products. You can paste this in your browser console to scan for videos and suggest mappings.

## Components

The key components for video display are:

- `EnhancedProductMedia.tsx` - The main component for displaying videos
- `useVideoLoader.ts` - A custom hook that manages video loading and fallbacks
- `video-utils.ts` - Utility functions for video URL mapping

## Troubleshooting

If videos aren't playing correctly:

1. Check that the video file exists in the `/public/video/` directory
2. Verify the mapping in `video-utils.ts` is correct
3. Try accessing the video URL directly (e.g., `/video/example.mp4`) to check if it loads
4. Check browser console for any errors
5. Try a different browser to rule out compatibility issues
6. Make sure videos are in MP4 format

## Video Requirements

For best results:
- Use H.264 codec for MP4 videos
- Keep frame rate at 30fps or lower
- Use square aspect ratio for consistent display
- Optimize video files for web (using tools like Handbrake)