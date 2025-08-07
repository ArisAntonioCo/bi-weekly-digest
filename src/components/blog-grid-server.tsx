import { BlogCard } from '@/components/ui/blog-card'
import { BlogPaginationServer } from './blog-pagination-server'
import { Blog } from '@/types/blog'
import { TrendingUp, Search } from 'lucide-react'

interface BlogGridServerProps {
  blogs: Blog[]
  currentPage: number
  totalPages: number
  total: number
  perPage: number
  searchQuery?: string
}

export function BlogGridServer({ 
  blogs, 
  currentPage,
  totalPages,
  total,
  perPage,
  searchQuery
}: BlogGridServerProps) {
  if (blogs.length === 0 && total === 0 && !searchQuery) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Analysis Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Check back soon for the latest investment insights and analysis.
          </p>
        </div>
      </div>
    )
  }

  if (blogs.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Results Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No blogs match your search for &quot;{searchQuery}&quot;. Try different keywords or clear your search.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <BlogPaginationServer
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
        />
      )}
    </div>
  )
}