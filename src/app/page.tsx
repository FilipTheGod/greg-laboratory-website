// src/app/page.tsx
import { getAllProducts } from "@/lib/shopify"
import ProductGrid from "@/components/products/ProductGrid"

export default async function Home() {
  try {
    const products = await getAllProducts()

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
