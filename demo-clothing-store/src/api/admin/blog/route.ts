import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BlogModuleService from "../../../modules/blog/service"
import { BLOG_MODULE } from "../../../modules/blog"

/**
 * GET /admin/blog
 * Fetch all blog posts (including unpublished)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const { page = 1, limit = 10 } = req.query as any

    try {
        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [posts, count] = await blogModuleService.listAndCountBlogPosts({}, {
            skip,
            take,
            order: {
                created_at: "DESC",
            },
        })

        res.json({ 
            posts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / Number(limit)),
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching blog posts",
            error: error.message,
        })
    }
}

/**
 * POST /admin/blog
 * Create a new blog post
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

    try {
        const body = req.body as {
            title: string
            slug: string
            excerpt?: string
            content: string
            featured_image?: string
            author?: string
            published?: boolean
            meta_title?: string
            meta_description?: string
        }

        const {
            title,
            slug,
            excerpt,
            content,
            featured_image,
            author,
            published,
            meta_title,
            meta_description,
        } = body

        // Auto-publish if published flag is true
        const published_at = published ? new Date() : null

        const post = await blogModuleService.createBlogPosts({
            title,
            slug,
            excerpt,
            content,
            featured_image,
            author: author || "Alariya Team",
            published: published || false,
            published_at,
            meta_title,
            meta_description,
        })

        res.json({ post })
    } catch (error) {
        res.status(500).json({
            message: "Error creating blog post",
            error: error.message,
        })
    }
}
