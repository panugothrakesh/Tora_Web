import 'server-only'

import { defineLive } from 'next-sanity'
import { client } from '@/sanity/lib/client'

const token = process.env.SANITY_API_READ_TOKEN;
if (!token) throw new Error('SANITY_API_READ_TOKEN is not set');

export const { sanityFetch } = defineLive({
  client,
  serverToken: token,
  fetchOptions: {
    revalidate: 0,
  },
})