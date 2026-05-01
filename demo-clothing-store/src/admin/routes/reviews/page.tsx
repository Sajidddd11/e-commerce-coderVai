import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Button, Text, Select, Input } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { CheckCircleSolid, XCircleSolid, Trash, ChatBubbleLeftRight } from "@medusajs/icons"
import { useUserRole } from "../../hooks/useUserRole"

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, pending, approved
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const { role } = useUserRole()
  const isAdmin = role === "admin"

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (filter !== "all") {
        params.append("is_approved", filter === "approved" ? "true" : "false")
      }

      const response = await fetch(`/admin/reviews?${params}`)
      const data = await response.json()

      setReviews(data.reviews || [])
      setPagination(data.pagination || { total: 0, pages: 1 })
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [page, filter])

  // Approve review
  const handleApprove = async (reviewId: string) => {
    try {
      await fetch(`/admin/reviews/${reviewId}/approve`, {
        method: "POST",
      })
      fetchReviews() // Refresh list
    } catch (error) {
      console.error("Failed to approve review:", error)
    }
  }

  // Reject review
  const handleReject = async (reviewId: string) => {
    try {
      await fetch(`/admin/reviews/${reviewId}/reject`, {
        method: "POST",
      })
      fetchReviews() // Refresh list
    } catch (error) {
      console.error("Failed to reject review:", error)
    }
  }

  // Delete review
  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      await fetch(`/admin/reviews/${reviewId}`, {
        method: "DELETE",
      })
      fetchReviews() // Refresh list
    } catch (error) {
      console.error("Failed to delete review:", error)
    }
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get pending count
  const pendingCount = reviews.filter((r: any) => !r.is_approved).length

  if (loading && reviews.length === 0) {
    return (
      <Container className="p-8 bg-ui-bg-base">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-fg-base"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-8 bg-ui-bg-base">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level="h1" className="text-2xl font-bold text-ui-fg-base">
              Product Reviews
            </Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Manage customer reviews and ratings
            </Text>
          </div>
          {pendingCount > 0 && (
            <Badge color="orange" size="small">
              {pendingCount} Pending Approval
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <Select.Trigger className="w-48">
              <Select.Value placeholder="Filter by status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Reviews</Select.Item>
              <Select.Item value="pending">Pending Approval</Select.Item>
              <Select.Item value="approved">Approved</Select.Item>
            </Select.Content>
          </Select>

          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by customer name, email, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
          <Text className="text-ui-fg-muted">No reviews found</Text>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className={`border rounded-lg p-4 transition-colors ${!review.is_approved 
                ? "bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50" 
                : "bg-ui-bg-base border-ui-border-base"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-ui-bg-component flex items-center justify-center border border-ui-border-base">
                      <span className="text-sm font-semibold text-ui-fg-subtle">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-ui-fg-base">{review.customer_name}</Text>
                        {review.is_verified_purchase && (
                          <Badge color="green" size="small">
                            Verified Purchase
                          </Badge>
                        )}
                        {!review.is_approved && (
                          <Badge color="orange" size="small">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <Text className="text-xs text-ui-fg-muted">
                        {review.customer_email}
                      </Text>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-4 mb-2">
                    <Text className="text-sm">{renderStars(review.rating)}</Text>
                    <Text className="text-xs text-ui-fg-muted">
                      {formatDate(review.created_at)}
                    </Text>
                  </div>

                  {/* Review Content */}
                  <div className="mb-3">
                    <Text className="font-semibold mb-1 text-ui-fg-base">{review.title}</Text>
                    <Text className="text-sm text-ui-fg-subtle">{review.content}</Text>
                  </div>

                  {/* Product Info */}
                  <Text className="text-xs text-ui-fg-muted">
                    Product ID: {review.product_id}
                  </Text>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-ui-fg-muted">
                    <span>👍 {review.helpful_count} helpful</span>
                    <span>👎 {review.not_helpful_count} not helpful</span>
                  </div>

                  {/* Admin Response */}
                  {review.admin_response && (
                    <div className="mt-3 bg-blue-50/50 border-l-4 border-blue-400 p-3 rounded dark:bg-blue-900/20 dark:border-blue-600">
                      <Text className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Your Response:
                      </Text>
                      <Text className="text-sm text-blue-800 dark:text-blue-200">
                        {review.admin_response}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {!review.is_approved ? (
                    <>
                      <Button
                        size="small"
                        variant="primary"
                        onClick={() => handleApprove(review.id)}
                      >
                        <CheckCircleSolid className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleReject(review.id)}
                      >
                        <XCircleSolid className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleReject(review.id)}
                    >
                      <XCircleSolid className="h-4 w-4 mr-1" />
                      Unapprove
                    </Button>
                  )}

                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      const response = prompt("Enter your response to this review:")
                      if (response) {
                        fetch(`/admin/reviews/${review.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ admin_response: response }),
                        }).then(() => fetchReviews())
                      }
                    }}
                  >
                    <ChatBubbleLeftRight className="h-4 w-4 mr-1" />
                    Respond
                  </Button>

                  {isAdmin && (
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
          <Text className="text-sm">
            Page {page} of {pagination.pages} ({pagination.total} total)
          </Text>
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
  label: "Reviews",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage
