// src/app/product/[id]/page.tsx
import { getProductByHandle } from "@/lib/shopify"
import ProductDetails from "@/components/products/ProductDetails"
import { notFound } from "next/navigation"

type Params = {
  id: string
}

type Props = {
  params: Params
}

export default async function ProductPage(props: Props) {
  try {
    // Destructure id directly to avoid accessing the property on params
    const { id } = props.params

    console.log("Product id:", id)

    if (!id) {
      console.log("No ID provided")
      notFound()
    }

    const product = await getProductByHandle(id)

    console.log(
      "Retrieved product:",
      product ? `${product.title} (found)` : "null (not found)"
    )

    if (!product) {
      notFound()
    }

    return <ProductDetails product={product} />
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}
