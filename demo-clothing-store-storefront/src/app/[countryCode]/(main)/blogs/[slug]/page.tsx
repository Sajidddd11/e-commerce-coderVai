import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveBlogPost } from "@lib/data/blog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface BlogDetailPageProps {
  params: Promise<{
    slug: string
    countryCode: string
  }>
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await retrieveBlogPost(resolvedParams.slug)
  if (!post) return { title: "Blog Not Found | ZAHAN" }

  return {
    title: `${post.title} | ZAHAN`,
    description: post.excerpt || "Read the latest updates from ZAHAN.",
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Await params for Next.js 15+ promise compatibility
  const resolvedParams = await params
  const post = await retrieveBlogPost(resolvedParams.slug)
  
  if (!post) {
    notFound()
  }

  // Format author name to Zahan Team if default is present
  const authorName = post.author === "Alariya Team" ? "Zahan Team" : post.author

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-black text-[#56aebf] py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#56aebf]/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#56aebf]/2 blur-[100px] pointer-events-none" />

      <article className="max-w-3xl mx-auto relative z-10">
        {/* Back Button */}
        <LocalizedClientLink
          href="/blogs"
          className="inline-flex items-center gap-x-2 text-sm text-[#56aebf] hover:text-white mb-12 transition-all font-semibold group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Blogs
        </LocalizedClientLink>

        {/* Post Header */}
        <header className="mb-10 animate-fade-in-top">
          <div className="flex items-center gap-x-3 text-xs text-white/50 mb-4">
            {publishDate && (
              <div className="flex items-center gap-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#56aebf]/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <time dateTime={post.published_at || undefined}>{publishDate}</time>
              </div>
            )}
            <span>•</span>
            <span className="bg-[#56aebf]/10 text-[#56aebf] px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
              {authorName}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base md:text-lg text-white/70 italic font-light border-l-2 border-[#56aebf] pl-4 py-1 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image ? (
          <div className="relative aspect-[16/9] w-full bg-white/[0.03] overflow-hidden rounded-3xl border border-white/10 mb-12 shadow-2xl">
            <img
              src={post.featured_image}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-1 bg-gradient-to-r from-[#56aebf]/30 via-transparent to-transparent mb-12 rounded-full" />
        )}

        {/* Post Content */}
        <div 
          className="prose prose-invert max-w-none text-white/80 leading-relaxed text-base md:text-lg space-y-6 md:space-y-8
            [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-2 [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-4
            [&_p]:leading-relaxed [&_p]:mb-6
            [&_a]:text-[#56aebf] [&_a]:underline hover:[&_a]:text-white [&_a]:transition-colors
            [&_strong]:text-white [&_strong]:font-bold
            [&_blockquote]:border-l-4 [&_blockquote]:border-[#56aebf] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/65 [&_blockquote]:my-6
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
            [&_li]:text-white/85
            [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/10 [&_img]:my-8 [&_img]:mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}
