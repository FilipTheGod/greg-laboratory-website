// src/components/products/ProductDetails.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

// SVG Components for product attributes
const WaterRepellentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L5 12H19L12 2Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 16C7 18.7614 9.23858 21 12 21C14.7614 21 17 18.7614 17 16" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const BreathableIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6M12 22V18M4 12H2M6.31 6.31L4.8 4.8M17.69 6.31L19.2 4.8M6.31 17.69L4.8 19.2M17.69 17.69L19.2 19.2M22 12H20M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const StretchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9H20M4 15H20M9 4V20M15 4V20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

interface ProductDetailsProps {
  product: any; // We'd ideally type this properly with Shopify types
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(product.variants.map((variant: any) => variant.title.split(' / ')[0]))
  );

  // Extract available colors from variants
  const availableColors = Array.from(
    new Set(product.variants.map((variant: any) => {
      const parts = variant.title.split(' / ');
      return parts.length > 1 ? parts[1] : null;
    })).filter(Boolean)
  );

  // Get color codes (assuming you've added metafields or tags with color codes)
  const getColorCode = (colorName: string) => {
    // This is a placeholder - you would need to implement a way to get actual color codes
    // from your Shopify data (metafields, product tags, etc.)
    const colorMap: Record<string, string> = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Cream': '#FFFDD0',
      'Navy': '#000080',
      'Olive': '#808000',
      // Add more color mappings as needed
    };

    return colorMap[colorName] || '#CCCCCC';
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select both a size and color');
      return;
    }

    // Find the correct variant ID based on size and color
    const variant = product.variants.find((v: any) =>
      v.title === `${selectedSize} / ${selectedColor}`
    );

    if (!variant) {
      alert('Selected combination is not available');
      return;
    }

    // Add to cart via context
    addToCart({
      id: product.id,
      title: product.title,
      handle: product.handle,
      quantity: 1,
      variant: {
        id: variant.id,
        title: variant.title,
        price: variant.price,
        image: product.images[0].src
      }
    });
  };
  
  // Product attributes (this would come from your product metafields/tags)
  const productAttributes = [
    { name: 'Water Repellent', icon: <WaterRepellentIcon /> },
    { name: 'Breathable', icon: <BreathableIcon /> },
    { name: '2-Way Stretch', icon: <StretchIcon /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* Product Images - Left Side */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden bg-laboratory-white">
          {product.images && product.images.length > 0 && (
            <Image
              src={product.images[currentImageIndex].src}
              alt={`${product.title} - view ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {product.images && product.images.map((image: any, index: number) => (
            <button
              key={index}
              className={`relative aspect-square overflow-hidden border ${
                index === currentImageIndex ? 'border-laboratory-black' : 'border-transparent'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={image.src}
                alt={`${product.title} - thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info - Right Side */}
      <div className="sticky top-24 self-start space-y-8">
        <div>
          <h3 className="text-laboratory-black/70 text-medium tracking-wide uppercase mb-1">
            {product.productType}
          </h3>
          <h1 className="text-title tracking-wide uppercase mb-2">
            {product.title}
          </h1>
          <p className="text-medium tracking-wide mb-6">
            ${parseFloat(product.variants[0].price).toFixed(2)}
          </p>
        </div>

        {/* Size Selection */}
        <div>
          <h2 className="text-medium tracking-wide mb-3">SIZE</h2>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 border ${
                  selectedSize === size
                    ? 'border-laboratory-black bg-laboratory-black text-laboratory-white'
                    : 'border-laboratory-black/30 hover:border-laboratory-black'
                } text-regular tracking-wide`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <h2 className="text-medium tracking-wide mb-3">COLOR</h2>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border ${
                  selectedColor === color
                    ? 'border-laboratory-black ring-2 ring-laboratory-black/30 ring-offset-2'
                    : 'border-laboratory-black/30'
                }`}
                style={{ backgroundColor: getColorCode(color) }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Color: ${color}`}
              />
            ))}
          </div>
          {selectedColor && (
            <p className="mt-2 text-regular tracking-wide">
              {selectedColor}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="w-full py-3 bg-laboratory-black text-laboratory-white text-medium tracking-wide"
          onClick={handleAddToCart}
        >
          ADD TO CART
        </button>

        {/* Product Description */}
        <div className="border-t border-laboratory-black/10 pt-6 space-y-6">
          <div>
            <h2 className="text-medium tracking-wide mb-3">DESCRIPTION</h2>
            <div
              className="text-regular tracking-wide"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>

          {/* Product Attributes */}
          <div>
            <h2 className="text-medium tracking-wide mb-3">DETAILS</h2>
            <div className="flex flex-wrap gap-6">
              {productAttributes.map((attr, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="p-3 border border-laboratory-black/10 rounded-full mb-2">
                    {attr.icon}
                  </div>
                  <span className="text-regular tracking-wide">{attr.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;