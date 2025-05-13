// Updated src/constants/config.ts with detailed comments

/**
 * Configuration flags for the site
 * Edit these flags to enable/disable features
 */

/**
 * SHOW_FILTERS
 * When set to true, the product filters will be displayed in the UI
 *
 * INSTRUCTIONS:
 * 1. To enable filters, set this to true
 * 2. Update this value around [date in 2 weeks] when you plan to launch more product series
 * 3. After changing this value to true, restart your development server
 */
export const SHOW_FILTERS = false;

/**
 * PRODUCT_CATEGORIES
 * The list of all product categories used in filters
 * These match the Shopify product types
 */
export const PRODUCT_CATEGORIES = [
  "ALL",
  "STANDARD SERIES",
  "TECHNICAL SERIES",
  "LABORATORY EQUIPMENT SERIES",
  "COLLABORATIVE PROTOCOL SERIES",
  "FIELD STUDY SERIES",
];

/**
 * CATEGORY_DISPLAY_NAMES
 * Maps internal category names to display names shown in the UI
 * Used to shorten longer category names for better display
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "ALL": "ALL",
  "STANDARD SERIES": "STANDARD",
  "TECHNICAL SERIES": "TECHNICAL",
  "LABORATORY EQUIPMENT SERIES": "LABORATORY EQUIPMENT",
  "COLLABORATIVE PROTOCOL SERIES": "COLLABORATIVE PROTOCOL",
  "FIELD STUDY SERIES": "FIELD STUDY",
};

/**
 * Implementation notes:
 *
 * To use these flags in your components, import them like this:
 * ```
 * import { SHOW_FILTERS } from "@/constants/config"
 * ```
 *
 * Then use conditional rendering:
 * ```
 * {SHOW_FILTERS && <YourFilterComponent />}
 * ```
 */