import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge } from "@medusajs/ui"
import { PencilSquare, Trash, Plus } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { useUserRole } from "../../hooks/useUserRole"

const BlogListPage = () => {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ total: 0, pages: 1 })
    const { role } = useUserRole()
    const isAdmin = role === "admin"

    useEffect(() => {
        fetchPosts()
    }, [page])

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/admin/blog?page=${page}&limit=10`, {
                credentials: "include",
            })
            const data = await response.json()
            setPosts(data.posts || [])
            setPagination(data.pagination || { total: 0, pages: 1 })
        } catch (error) {
            console.error("Error fetching posts:", error)
        } finally {
            setLoading(false)
        }
    }

    const deletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return

        try {
            await fetch(`/admin/blog/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            fetchPosts() // Refresh list
        } catch (error) {
            console.error("Error deleting post:", error)
            alert("Failed to delete post")
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-64 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                    <p className="text-ui-fg-muted font-medium animate-pulse">Loading...</p>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <Heading level="h1">Blog Posts</Heading>
                <Button
                    onClick={() => (window.location.href = "/app/blog/new")}
                    variant="primary"
                >
                    <Plus />
                    Create Post
                </Button>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-16 border rounded-2xl border-dashed border-ui-border-base bg-ui-bg-subtle/50">
                    <PencilSquare className="mx-auto w-10 h-10 text-ui-fg-muted mb-4 opacity-40" />
                    <p className="text-ui-fg-subtle font-medium mb-6">No blog posts yet</p>
                    <Button onClick={() => (window.location.href = "/app/blog/new")} variant="secondary">
                        Create Your First Post
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Slug</Table.HeaderCell>
                            <Table.HeaderCell>Author</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Published</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {posts.map((post) => (
                            <Table.Row key={post.id}>
                                <Table.Cell className="font-medium">{post.title}</Table.Cell>
                                <Table.Cell>
                                    <code className="text-xs bg-ui-bg-subtle px-2 py-1 rounded border border-ui-border-base text-ui-fg-subtle">
                                        {post.slug}
                                    </code>
                                </Table.Cell>
                                <Table.Cell>{post.author}</Table.Cell>
                                <Table.Cell>
                                    {post.published ? (
                                        <Badge color="green">Published</Badge>
                                    ) : (
                                        <Badge color="orange">Draft</Badge>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    {post.published_at
                                        ? new Date(post.published_at).toLocaleDateString()
                                        : "-"}
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            size="small"
                                            variant="secondary"
                                            onClick={() =>
                                                (window.location.href = `/app/blog/${post.id}`)
                                            }
                                        >
                                            <PencilSquare />
                                            Edit
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                size="small"
                                                variant="danger"
                                                onClick={() => deletePost(post.id)}
                                            >
                                                <Trash />
                                            </Button>
                                        )}
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {page} of {pagination.pages} ({pagination.total} total)
                    </span>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Blog Posts",
    icon: PencilSquare,
})

export default BlogListPage
