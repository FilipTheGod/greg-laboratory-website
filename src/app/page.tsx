// src/app/page.tsx
import { getAllProducts } from "@/lib/shopify"
import ProductGrid from "@/components/products/ProductGrid"

export default async function Home() {
  console.log("Rendering Home Page")

  try {
    const products = await getAllProducts()
    console.log(`Retrieved ${products.length} products for home page`)

    // Log first product for debugging
    if (products.length > 0) {
      console.log("First product sample:", {
        title: products[0].title,
        handle: products[0].handle,
        hasVariants: products[0].variants && products[0].variants.length > 0,
        variantsCount: products[0].variants?.length,
        hasImages: products[0].images && products[0].images.length > 0,
        imagesCount: products[0].images?.length,
        hasMedia: !!products[0].media,
        mediaCount: products[0].media?.length,
      })
    }

    return (
      <div>
        <ProductGrid initialProducts={products} />
      </div>
    )
  } catch (error) {
    console.error("Error in Home Page:", error)
    return (
      <div className="p-8">
        <h2 className="text-xl font-medium text-red-600">
          Error loading products. Please check the console for details.
        </h2>
      </div>
    )
  }
}
