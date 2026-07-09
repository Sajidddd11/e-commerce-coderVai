import { Metadata } from "next"
import { listBlogPosts } from "@lib/data/blog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Blogs | ZAHAN",
  description: "Stay updated with the latest fashion trends, style guides, and lifestyle tips from the ZAHAN team.",
}

interface BlogsPageProps {
  params: Promise<{
    countryCode: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function BlogsPage({ params, searchParams }: BlogsPageProps) {
  // Await searchParams for Next.js 15+ promise compatibility
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1
  const limit = 9
  
  const { posts, pagination } = await listBlogPosts(currentPage, limit)

  // Map author names to "Zahan Team" if they are the default "Alariya Team"
  const formattedPosts = posts.map(post => ({
    ...post,
    author: post.author === "Alariya Team" ? "Zahan Team" : post.author
  }))

  return (
    <div className="min-h-screen bg-black text-[#56aebf] py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#56aebf]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#56aebf]/3 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-[#56aebf] opacity-80">
            ZAHAN JOURNAL
          </p>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#56aebf] to-[#a2d8e4]">Blogs</span>
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-[#56aebf] to-transparent mx-auto mb-6 rounded-full" />
          <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Latest trends, updates, guidelines, and stories straight from our team.
          </p>
        </div>

        {formattedPosts.length === 0 ? (
          <div className="text-center py-24 border border-[#56aebf]/20 rounded-3xl bg-white/[0.01] backdrop-blur-md max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-45">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.493 8.25h13.486a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H3.007a.5.5 0 0 0-.5.5v14.25a.5.5 0 0 0 .5.5Z" />
            </svg>
            <p className="text-white font-medium text-lg">No blog posts found.</p>
            <p className="text-sm text-white/40 mt-1">Check back later for new updates!</p>
          </div>
        ) : (
          <>
            {/* Display single post as a full featured post rather than an empty 1/3 card column */}
            {formattedPosts.length === 1 ? (
              <div className="max-w-4xl mx-auto">
                {formattedPosts.map((post) => {
                  const publishDate = post.published_at 
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null

                  return (
                    <article 
                      key={post.id}
                      className="group flex flex-col md:flex-row bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-[#56aebf]/40 rounded-3xl overflow-hidden transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(86,174,191,0.2)]"
                    >
                      {/* Featured Image or fallback gradient */}
                      <div className="relative md:w-1/2 aspect-[16/11] md:aspect-auto min-h-[280px] bg-gradient-to-br from-[#0c2328] via-[#050e10] to-black overflow-hidden flex items-center justify-center">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#123941] via-[#051114] to-black opacity-40 flex items-center justify-center">
                            <span className="text-8xl font-black text-white/5 select-none">ZAHAN</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent opacity-80" />
                      </div>

                      {/* Content Panel */}
                      <div className="p-8 md:p-12 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-x-4 text-xs text-white/40 mb-4">
                            {publishDate && (
                              <div className="flex items-center gap-x-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#56aebf]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                <time dateTime={post.published_at || undefined}>{publishDate}</time>
                              </div>
                            )}
                            <span>•</span>
                            <span className="bg-[#56aebf]/10 text-[#56aebf] px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                              {post.author}
                            </span>
                          </div>

                          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 group-hover:text-[#56aebf] transition-colors duration-300 leading-tight">
                            <LocalizedClientLink href={`/blogs/${post.slug}`}>
                              {post.title}
                            </LocalizedClientLink>
                          </h2>

                          <p className="text-white/60 text-base leading-relaxed mb-8 font-light line-clamp-4">
                            {post.excerpt || "No summary available for this post. Click to read the full article."}
                          </p>
                        </div>

                        <LocalizedClientLink 
                          href={`/blogs/${post.slug}`}
                          className="inline-flex items-center text-sm font-bold text-[#56aebf] hover:text-white transition-colors gap-x-2 group-hover:translate-x-1 duration-300"
                        >
                          Read Article
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </LocalizedClientLink>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {formattedPosts.map((post) => {
                  const publishDate = post.published_at 
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null

                  return (
                    <article 
                      key={post.id} 
                      className="group flex flex-col bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-[#56aebf]/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_0_40px_rgba(86,174,191,0.15)]"
                    >
                      {/* Featured Image or fallback */}
                      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#0c2328] via-[#050e10] to-black overflow-hidden flex items-center justify-center">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#123941] via-[#051114] to-black opacity-35 flex items-center justify-center">
                            <span className="text-4xl font-extrabold text-white/5 select-none">ZAHAN</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      </div>

                      {/* Post Info */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Meta */}
                          <div className="flex items-center justify-between text-xs text-white/40 mb-4">
                            {publishDate && (
                              <time dateTime={post.published_at || undefined}>{publishDate}</time>
                            )}
                            <span className="bg-[#56aebf]/10 text-[#56aebf] px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider">
                              {post.author}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#56aebf] transition-colors duration-200 leading-tight">
                            <LocalizedClientLink href={`/blogs/${post.slug}`}>
                              {post.title}
                            </LocalizedClientLink>
                          </h2>

                          {/* Excerpt */}
                          <p className="text-sm text-white/60 mb-6 line-clamp-3 leading-relaxed font-light">
                            {post.excerpt || "No summary available for this post. Click to read the full article."}
                          </p>
                        </div>

                        {/* Read More Link */}
                        <LocalizedClientLink 
                          href={`/blogs/${post.slug}`}
                          className="inline-flex items-center text-sm font-semibold text-[#56aebf] hover:text-white transition-colors gap-x-1.5 mt-auto group-hover:translate-x-1 duration-200"
                        >
                          Read Article
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </LocalizedClientLink>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-x-4 mt-16 pt-8 border-t border-white/10">
                <LocalizedClientLink
                  href={`/blogs?page=${Math.max(1, currentPage - 1)}`}
                  className={`px-4 py-2 border border-white/10 rounded-xl text-sm font-medium transition-all ${
                    currentPage === 1 
                      ? "opacity-50 pointer-events-none text-white/30" 
                      : "text-white hover:border-[#56aebf]/50 hover:bg-[#56aebf]/5"
                  }`}
                >
                  Previous
                </LocalizedClientLink>
                
                <span className="text-sm text-white/50">
                  Page {currentPage} of {pagination.pages}
                </span>

                <LocalizedClientLink
                  href={`/blogs?page=${Math.min(pagination.pages, currentPage + 1)}`}
                  className={`px-4 py-2 border border-white/10 rounded-xl text-sm font-medium transition-all ${
                    currentPage === pagination.pages 
                      ? "opacity-50 pointer-events-none text-white/30" 
                      : "text-white hover:border-[#56aebf]/50 hover:bg-[#56aebf]/5"
                  }`}
                >
                  Next
                </LocalizedClientLink>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
