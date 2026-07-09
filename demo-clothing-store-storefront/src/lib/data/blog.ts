import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export const listBlogPosts = async (page: number = 1, limit: number = 9) => {
  const next = {
    ...(await getCacheOptions("blog")),
    revalidate: 60, // Revalidate every 60 seconds
  }

  return sdk.client
    .fetch<{ posts: BlogPost[]; pagination: BlogPagination }>(
      `/store/blog?page=${page}&limit=${limit}`,
      {
        next,
      }
    )
    .catch((err) => {
      console.error("Error fetching blog posts from API:", err)
      return {
        posts: [] as BlogPost[],
        pagination: { page: 1, limit: 9, total: 0, pages: 1 },
      }
    })
}

export const retrieveBlogPost = async (slug: string) => {
  const next = {
    ...(await getCacheOptions("blog")),
    revalidate: 60, // Revalidate every 60 seconds
  }

  return sdk.client
    .fetch<{ post: BlogPost }>(
      `/store/blog/${slug}`,
      {
        next,
      }
    )
    .then(({ post }) => post)
    .catch((err) => {
      console.error(`Error fetching blog post by slug ${slug}:`, err)
      return null
    })
}
