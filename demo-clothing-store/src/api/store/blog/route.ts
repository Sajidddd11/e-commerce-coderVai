import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BlogModuleService from "../../../modules/blog/service"
import { BLOG_MODULE } from "../../../modules/blog"

/**
 * GET /store/blog
 * Fetch all published blog posts
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const { page = 1, limit = 9 } = req.query as any

    try {
        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [posts, count] = await blogModuleService.listAndCountBlogPosts({
            published: true,
        }, {
            select: [
                "id",
                "title",
                "slug",
                "excerpt",
                "featured_image",
                "author",
                "published_at",
                "created_at",
            ],
            skip,
            take,
            order: {
                published_at: "DESC",
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
