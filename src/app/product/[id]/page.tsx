// src/app/product/[id]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Mock product data - would be fetched from Shopify
const mockProducts = {
  '1': {
    id: '1',
    title: 'PC-SS-P23',
    price: 450,
    description: 'Built for navigating urban landscapes, the Standard Series Pant features articulated knees, elasticated waistband, and hidden back zip pocket.',
    category: 'STANDARD SERIES',
    videoUrl: '/videos/product1.mp4',
    images: ['/images/product1-1.jpg', '/images/product1-2.jpg', '/images/product1-3.jpg'],
  },
  // Add more products
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const product = mockProducts[id as keyof typeof mockProducts];

  // Handle product not found
  if (!product) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      <div className="space-y-4">
        <video
          className="w-full aspect-square object-cover"
          src={product.videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="grid grid-cols-3 gap-4">
          {product.images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt={`${product.title} - view ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-sm text-laboratory-black/70 mb-1">{product.category}</h3>
        <h1 className="text-2xl mb-2">{product.title}</h1>
        <p className="text-xl mb-6">${product.price}</p>

        <p className="mb-8">{product.description}</p>

        <button className="w-full py-3 bg-laboratory-black text-laboratory-white mb-4">
          ADD TO CART
        </button>

        <div className="border-t border-laboratory-black/10 pt-6 mt-6">
          <h2 className="text-lg mb-4">Details</h2>
          <ul className="list-disc pl-4 space-y-2">
            <li>2-way stretch water-repellent fabric</li>
            <li>Articulated knees</li>
            <li>Elasticated waistband</li>
            <li>Internal drawcord</li>
            <li>Signature circle pockets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}