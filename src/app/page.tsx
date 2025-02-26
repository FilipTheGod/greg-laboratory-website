// src/app/page.tsx
import { getAllProducts } from '@/lib/shopify';
import ProductGrid from '@/components/products/ProductGrid';

export default async function Home() {
  const products = await getAllProducts();

  return (
    <ProductGrid initialProducts={products} />
  );
}