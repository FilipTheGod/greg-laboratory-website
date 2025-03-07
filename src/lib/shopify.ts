// src/lib/shopify.ts
import Client from 'shopify-buy';

// Define types for the line items
interface LineItem {
  variantId: string;
  quantity: number;
}

interface LineItemUpdate {
  id: string;
  quantity: number;
}

// Define Shopify product types
export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  available?: boolean;
  image?: string;
}

export interface ShopifyImage {
  src: string;
  alt?: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  productType: string;
  descriptionHtml: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

// Create a Shopify client
const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  apiVersion: '2024-01' // Adding the required apiVersion
});

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    const products = await client.product.fetchAll();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const product = await client.product.fetchByHandle(handle);
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error);
    return null;
  }
}

// Checkout functions
export async function createCheckout() {
  try {
    const checkout = await client.checkout.create();
    return checkout;
  } catch (error) {
    console.error("Error creating checkout:", error);
    throw error;
  }
}

export async function fetchCheckout(checkoutId: string) {
  try {
    const checkout = await client.checkout.fetch(checkoutId);
    return checkout;
  } catch (error) {
    console.error("Error fetching checkout:", error);
    throw error;
  }
}

export async function addItemToCheckout(checkoutId: string, lineItemsToAdd: LineItem[]) {
  try {
    const checkout = await client.checkout.addLineItems(checkoutId, lineItemsToAdd);
    return checkout;
  } catch (error) {
    console.error("Error adding item to checkout:", error);
    throw error;
  }
}

export async function updateCheckoutItem(checkoutId: string, lineItemsToUpdate: LineItemUpdate[]) {
  try {
    const checkout = await client.checkout.updateLineItems(checkoutId, lineItemsToUpdate);
    return checkout;
  } catch (error) {
    console.error("Error updating checkout item:", error);
    throw error;
  }
}

export async function removeCheckoutItem(checkoutId: string, lineItemIdsToRemove: string[]) {
  try {
    const checkout = await client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove);
    return checkout;
  } catch (error) {
    console.error("Error removing checkout item:", error);
    throw error;
  }
}

export default client;