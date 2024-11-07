import { defineQuery } from 'next-sanity'
import { sanityFetch } from '@/sanity/lib/live'

export const getAllProducts = async () => {
  const ALL_PRODUCTS_QUERY = defineQuery(`*[_type == "product"] | order(_updatedAt asc)`)
  try {
    const products = await sanityFetch({ query: ALL_PRODUCTS_QUERY })
    return products.data || [];
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}