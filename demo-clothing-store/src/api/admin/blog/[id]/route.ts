import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BlogModuleService from "../../../../modules/blog/service"
import { BLOG_MODULE } from "../../../../modules/blog"

/**
 * GET /admin/blog/:id
 * Fetch a single blog post by ID
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const { id } = req.params

    try {
        const post = await blogModuleService.retrieveBlogPost(id)

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

/**
 * POST /admin/blog/:id
 * Update a blog post
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const { id } = req.params

    try {
        const body = req.body as Record<string, any>
        const updateData: any = { ...body, id }

        // If publishing for the first time, set published_at
        if (updateData.published && !updateData.published_at) {
            updateData.published_at = new Date()
        }

        // If unpublishing, clear published_at
        if (updateData.published === false) {
            updateData.published_at = null
        }

        const post = await blogModuleService.updateBlogPosts(updateData)

        res.json({ post })
    } catch (error) {
        res.status(500).json({
            message: "Error updating blog post",
            error: error.message,
        })
    }
}

/**
 * DELETE /admin/blog/:id
 * Delete a blog post
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const { id } = req.params

    try {
        await blogModuleService.deleteBlogPosts(id)

        res.json({
            id,
            deleted: true,
        })
    } catch (error) {
        res.status(500).json({
            message: "Error deleting blog post",
            error: error.message,
        })
    }
}
