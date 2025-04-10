// scripts/expose-metafields.ts
/**
 * This script exposes product metafields to the Storefront API
 * Run with: npx ts-node scripts/expose-metafields.ts
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ""
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || ""

// List of features to expose - IMPORTANT: these must match exactly with your metafield keys in Shopify
const featuresToExpose = [
  "stretch",
  "breathable",
  "water_repellent",
  "light_weight",
  "quick_dry",
  "anti_pilling",
  "easy_care",
  "antistatic_thread",
  "keep_warm",
  "cotton_touch",
  "uv_cut",
  "washable",
  "eco",
  "water_proof",
  "water_absorption",
]

async function exposeMetafieldToStorefront(key: string) {
  try {
    const mutation = `
      mutation metafieldStorefrontVisibilityCreate($input: MetafieldStorefrontVisibilityInput!) {
        metafieldStorefrontVisibilityCreate(input: $input) {
          metafieldStorefrontVisibility {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        namespace: "features",
        key: key,
        ownerType: "PRODUCT",
      },
    }

    console.log(`Attempting to expose ${key} metafield to Storefront API...`)

    const response = await fetch(
      `https://${domain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminAccessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      }
    )

    const result = await response.json()
    console.log(`Response for ${key}:`, JSON.stringify(result, null, 2))

    if (result.errors) {
      console.error(`Error exposing metafield ${key}:`, result.errors)
      return false
    }

    if (
      result.data?.metafieldStorefrontVisibilityCreate?.userErrors?.length > 0
    ) {
      const errors = result.data.metafieldStorefrontVisibilityCreate.userErrors
      // If the error is just that it's already exposed, consider it a success
      if (errors.some((err) => err.message.includes("already exists"))) {
        console.log(`Metafield ${key} is already exposed to Storefront API`)
        return true
      }

      console.warn(`Warning exposing metafield ${key}:`, errors)
      return false
    }

    console.log(`Successfully exposed metafield ${key} to Storefront API`)
    return true
  } catch (error) {
    console.error(`Error processing metafield ${key}:`, error)
    return false
  }
}

async function main() {
  console.log(
    `Exposing ${featuresToExpose.length} metafields to Storefront API...`
  )
  console.log(`Using Shopify store: ${domain}`)

  if (!adminAccessToken) {
    console.error("SHOPIFY_ADMIN_ACCESS_TOKEN is not set in .env.local")
    process.exit(1)
  }

  let successCount = 0

  for (const feature of featuresToExpose) {
    const success = await exposeMetafieldToStorefront(feature)
    if (success) successCount++
  }

  console.log(
    `Completed! Successfully exposed ${successCount} of ${featuresToExpose.length} metafields to Storefront API.`
  )
  console.log("Next steps:")
  console.log(
    "1. In your Shopify admin, go to the product page and set the feature values"
  )
  console.log("2. Restart your development server")
  console.log("3. Check your product page to see the features displayed")
}

main().catch(console.error)
