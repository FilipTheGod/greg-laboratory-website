// src/components/products/ProductGrid.tsx
'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';

interface ProductGridProps {
  initialProducts: any[]; // We'd type this properly with Shopify types
}

type ProductCategory =
  | 'STANDARD SERIES'
  | 'TECHNICAL SERIES'
  | 'LABORATORY EQUIPMENT SERIES'
  | 'COLLABORATIVE PROTOCOL SERIES'
  | 'FIELD STUDY SERIES'
  | 'ALL';

// Helper to map Shopify product types to our categories
const mapProductTypeToCategory = (productType: string): ProductCategory => {
  const typeMap: Record<string, ProductCategory> = {
    'Standard Series': 'STANDARD SERIES',
    'Technical Series': 'TECHNICAL SERIES',
    'Laboratory Equipment': 'LABORATORY EQUIPMENT SERIES',
    'Collaborative Protocol': 'COLLABORATIVE PROTOCOL SERIES',
    'Field Study': 'FIELD STUDY SERIES',
  };

  return typeMap[productType] || 'STANDARD SERIES';
};

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
  const [filteredCategory, setFilteredCategory] = useState<ProductCategory>('ALL');

  const filteredProducts = filteredCategory === 'ALL'
    ? initialProducts
    : initialProducts.filter(product =>
        mapProductTypeToCategory(product.productType) === filteredCategory
      );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6">
      <div className="md:col-span-1">
        <ProductFilter onFilterChange={setFilteredCategory} />
      </div>
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;