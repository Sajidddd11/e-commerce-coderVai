import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BlogModuleService from "../../../../modules/blog/service"
import { BLOG_MODULE } from "../../../../modules/blog"

/**
 * GET /store/blog/:slug
 * Fetch a single blog post by slug
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const { slug } = req.params

    try {
        const [post] = await blogModuleService.listBlogPosts({
            slug: slug,
            published: true,
        })

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found",
            })
        }

        res.json({ post })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching blog post",
            error: error.message,
        })
    }
}
