import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
    id: model.id().primaryKey(),
    title: model.text(),
    slug: model.text().unique(),
    excerpt: model.text().nullable(),
    content: model.text(),
    featured_image: model.text().nullable(),
    author: model.text().default("Alariya Team"),
    published: model.boolean().default(false),
    published_at: model.dateTime().nullable(),
    meta_title: model.text().nullable(),
    meta_description: model.text().nullable(),
})

export default BlogPost
