// src/components/products/ProductDetails.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { ShopifyProduct } from '@/lib/shopify';

// SVG Components for product attributes
const WaterRepellentIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L5 12H19L12 2Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 16C7 18.7614 9.23858 21 12 21C14.7614 21 17 18.7614 17 16" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const BreathableIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6M12 22V18M4 12H2M6.31 6.31L4.8 4.8M17.69 6.31L19.2 4.8M6.31 17.69L4.8 19.2M17.69 17.69L19.2 19.2M22 12H20M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const StretchIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9H20M4 15H20M9 4V20M15 4V20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const DurableIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LightweightIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V2M4 12H2M6.31 6.31L4.8 4.8M17.69 6.31L19.2 4.8M12 20V22M20 12H22M17.69 17.69L19.2 19.2M6.31 17.69L4.8 19.2M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EasyCareIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 16L12 12M12 12L16 8M12 12L8 8M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

// Define the color mapping for the color circles
const colorMap: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Cream': '#FFFDD0',
  'Navy': '#000080',
  'Olive': '#808000',
  'Grey': '#808080',
  'Khaki': '#C3B091',
  'Tan': '#D2B48C',
  'Brown': '#A52A2A',
  'Natural': '#F5F5DC',
  'Green': '#008000',
  'Blue': '#0000FF',
  'Red': '#FF0000',
  'Pink': '#FFC0CB',
};

interface ProductDetailsProps {
  product: ShopifyProduct;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showingSizeGuide, setShowingSizeGuide] = useState(false);

  const { addToCart, isLoading } = useCart();

  // Get current color from product title or type
  // This assumes each product is a specific color as mentioned in your setup
  const currentColor = product.title.split(' - ')[1] || '';

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        // Extract size from variant title (e.g., "S")
        return variant.title;
      })
    )
  ).sort();

  // Check if media has video
  const hasVideo = product.media &&
                 product.media.length > 0 &&
                 product.media[0].mediaContentType === 'VIDEO';

  // Get video URL if available
  const videoUrl = hasVideo && product.media?.[0]?.sources?.[0]?.url;

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Find the correct variant ID based on size
    const variant = product.variants.find((v) => v.title === selectedSize);

    if (!variant) {
      alert('Selected size is not available');
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

  // Get product features from metafields
  const getProductFeatures = () => {
    const features = [];

    // Check for features in metafields
    const metafields = product.metafields?.features;

    // If metafields are not available, determine features based on product type
    if (!metafields) {
      // Add default features based on product type
      if (product.productType === 'Technical Series') {
        features.push({ name: 'Durable', icon: <DurableIcon />, description: 'Built for extended wear and use' });
      }

      if (product.productType === 'Field Study Series') {
        features.push({ name: 'Lightweight', icon: <LightweightIcon />, description: 'Minimal weight for comfortable wear' });
      }

      // Add common features
      features.push({ name: 'Water Repellent', icon: <WaterRepellentIcon />,
                      description: 'Resists moisture and light rain' });
      features.push({ name: 'Breathable', icon: <BreathableIcon />,
                      description: 'Allows air circulation for comfort' });
      features.push({ name: '2-Way Stretch', icon: <StretchIcon />,
                      description: 'Flexible movement in multiple directions' });
    } else {
      // Use metafields to determine features
      if (metafields.waterRepellent) {
        features.push({ name: 'Water Repellent', icon: <WaterRepellentIcon />,
                       description: 'Resists moisture and light rain' });
      }

      if (metafields.breathable) {
        features.push({ name: 'Breathable', icon: <BreathableIcon />,
                       description: 'Allows air circulation for comfort' });
      }

      if (metafields.stretch) {
        features.push({ name: '2-Way Stretch', icon: <StretchIcon />,
                       description: 'Flexible movement in multiple directions' });
      }

      if (metafields.durable) {
        features.push({ name: 'Durable', icon: <DurableIcon />,
                       description: 'Built for extended wear and use' });
      }

      if (metafields.lightweight) {
        features.push({ name: 'Lightweight', icon: <LightweightIcon />,
                       description: 'Minimal weight for comfortable wear' });
      }

      if (metafields.easycare) {
        features.push({ name: 'Easy Care', icon: <EasyCareIcon />,
                       description: 'Simple to maintain and clean' });
      }
    }

    return features;
  };

  const productFeatures = getProductFeatures();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* Media Gallery - Left Side */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden bg-laboratory-white">
          {hasVideo && videoUrl ? (
            // Video display for first item
            <video
              key={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              controls
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : product.images && product.images.length > 0 ? (
            // Image display
            <Image
              src={product.images[currentMediaIndex].src}
              alt={`${product.title} - view ${currentMediaIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
              <span className="text-laboratory-black/30 text-medium tracking-wide">
                No Media Available
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail gallery */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {hasVideo && videoUrl && (
              <button
                className={`relative aspect-square overflow-hidden border ${
                  currentMediaIndex === 0 ? 'border-laboratory-black' : 'border-transparent'
                }`}
                onClick={() => setCurrentMediaIndex(0)}
              >
                {product.media?.[0]?.previewImage?.src ? (
                  <Image
                    src={product.media[0].previewImage.src}
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-laboratory-black/10">
                    <span className="text-laboratory-white text-xs">VIDEO</span>
                  </div>
                )}
              </button>
            )}

            {product.images.map((image, index) => {
              const thumbIndex = hasVideo ? index + 1 : index;
              return (
                <button
                  key={image.src}
                  className={`relative aspect-square overflow-hidden border ${
                    currentMediaIndex === thumbIndex ? 'border-laboratory-black' : 'border-transparent'
                  }`}
                  onClick={() => setCurrentMediaIndex(thumbIndex)}
                >
                  <Image
                    src={image.src}
                    alt={`${product.title} - thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Info - Right Side */}
      <div className="sticky top-24 self-start space-y-8 max-h-screen overflow-y-auto pr-4">
        <div>
          <h3 className="text-laboratory-black/70 text-medium tracking-wide uppercase mb-1">
            {product.productType}
          </h3>
          <h1 className="text-title tracking-wide uppercase mb-2">
            {product.title}
          </h1>
          <p className="text-medium tracking-wide mb-6">
            ${parseFloat(product.variants[0].price).toFixed(2)} USD
          </p>
        </div>

        {/* Color display - as in your reference image */}
        {currentColor && (
          <div className="mb-6">
            <h2 className="text-medium tracking-wide mb-3">COLOR</h2>
            <div className="flex space-x-4">
              <div
                className="w-10 h-10 rounded-full border border-laboratory-black/30"
                style={{ backgroundColor: colorMap[currentColor] || '#CCCCCC' }}
              />
              <span className="text-medium tracking-wide">{currentColor}</span>
            </div>
          </div>
        )}

        {/* Size Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-medium tracking-wide">SIZE</h2>
            <button
              className="text-regular tracking-wide underline"
              onClick={() => setShowingSizeGuide(!showingSizeGuide)}
            >
              Size Guide
            </button>
          </div>

          {showingSizeGuide && (
            <div className="mb-4 p-4 border border-laboratory-black/10">
              <h3 className="text-medium tracking-wide mb-2">Size Guide</h3>
              <table className="w-full text-regular">
                <thead>
                  <tr className="border-b border-laboratory-black/10">
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Chest (in)</th>
                    <th className="text-left py-2">Waist (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-laboratory-black/5">
                    <td className="py-2">S</td>
                    <td className="py-2">38-40</td>
                    <td className="py-2">30-32</td>
                  </tr>
                  <tr className="border-b border-laboratory-black/5">
                    <td className="py-2">M</td>
                    <td className="py-2">40-42</td>
                    <td className="py-2">32-34</td>
                  </tr>
                  <tr className="border-b border-laboratory-black/5">
                    <td className="py-2">L</td>
                    <td className="py-2">42-44</td>
                    <td className="py-2">34-36</td>
                  </tr>
                  <tr>
                    <td className="py-2">XL</td>
                    <td className="py-2">44-46</td>
                    <td className="py-2">36-38</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                className={`w-12 h-12 flex items-center justify-center border ${
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

        {/* Add to Cart Button with loading state */}
        <motion.button
          className="w-full py-3 bg-laboratory-black text-laboratory-white text-medium tracking-wide disabled:opacity-50 relative"
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          disabled={!selectedSize || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-laboratory-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ADDING...
            </span>
          ) : (
            'ADD TO CART'
          )}
        </motion.button>

        {/* Product Description */}
        <div className="mt-8 pt-8 border-t border-laboratory-black/10">
          <h2 className="text-medium tracking-wide mb-4">DESCRIPTION</h2>
          <div
            className="text-regular tracking-wide"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>

        {/* Product Features/Attributes with SVG Icons */}
        {productFeatures.length > 0 && (
          <div className="mt-8 pt-8 border-t border-laboratory-black/10">
            <h2 className="text-medium tracking-wide mb-4">PRODUCT FEATURES</h2>
            <div className="grid grid-cols-2 gap-6">
              {productFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-3 text-laboratory-black">{feature.icon}</div>
                  <div>
                    <h3 className="text-regular tracking-wide font-medium">{feature.name}</h3>
                    <p className="text-regular tracking-wide text-laboratory-black/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;