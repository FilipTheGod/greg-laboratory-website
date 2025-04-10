// scripts/verify-metafield-visibility.ts
/**
 * A script to verify if metafields are properly exposed to the Storefront API
 *
 * Run with:
 * npx ts-node scripts/verify-metafield-visibility.ts your-product-handle
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ""
const storefrontAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || ""

async function main() {
  try {
    // Get product handle from command line argument
    const handle = process.argv[2]

    if (!handle) {
      console.error("Please provide a product handle as an argument")
      console.log(
        "Example: npx ts-node scripts/verify-metafield-visibility.ts pc-fs-t24-black"
      )
      process.exit(1)
    }

    console.log(
      `Testing metafield visibility for product with handle: ${handle}`
    )

    // Execute a direct GraphQL query to the Storefront API
    const response = await fetch(`https://${domain}/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({
        query: `
            query GetProductMetafields($handle: String!) {
              productByHandle(handle: $handle) {
                title
                metafields(first: 20) {
                  edges {
                    node {
                      namespace
                      key
                      value
                    }
                  }
                }
                metafield(namespace: "features", key: "breathable") {
                  namespace
                  key
                  value
                }
              }
            }
          `,
        variables: {
          handle: handle,
        },
      }),
    })

    const data = await response.json()
    console.log("\nGraphQL Query Response:", JSON.stringify(data, null, 2))

    // Check for specific metafields
    if (data.data?.productByHandle?.metafields?.edges) {
      const edges = data.data.productByHandle.metafields.edges
      console.log(`\nFound ${edges.length} metafields for product ${handle}:`)

      for (const edge of edges) {
        console.log(
          `- ${edge.node.namespace}.${edge.node.key} = ${edge.node.value}`
        )
      }
    } else {
      console.log("\nNo metafields found in the response, which means:")
      console.log("1. There are no metafields for this product, or")
      console.log("2. Metafields are not exposed to the Storefront API")
    }

    // Check for specific features.breathable metafield
    if (data.data?.productByHandle?.metafield) {
      console.log("\nSpecific metafield check:")
      console.log(
        "features.breathable =",
        data.data.productByHandle.metafield.value
      )
    } else {
      console.log("\nCould not find the specific features.breathable metafield")
    }

    console.log(
      "\nIf you're not seeing your metafields, you need to expose them to the Storefront API:"
    )
    console.log(
      "1. Go to Shopify Admin > Settings > Apps and sales channels > Storefront API"
    )
    console.log(
      "2. Make sure 'Product metafields' is selected in the 'Data to expose' section"
    )

    console.log("\nTest completed!")
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

main()
