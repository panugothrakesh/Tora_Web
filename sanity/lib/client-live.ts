import { defineLive } from 'next-sanity'
import { client } from '@/sanity/lib/client'

const token = process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN
if (!token) throw new Error('SANITY_API_READ_TOKEN is not set')

export const { SanityLive } = defineLive({
  client,
  browserToken: token,
  fetchOptions: {
    revalidate: 0,
  },
}) 