import { BlogGridServer } from './blog-grid-server'
import { getBlogs, prefetchAdjacentPages } from '@/lib/blog-cache'

interface BlogListServerProps {
  searchParams: {
    page?: string
    search?: string
    sort?: string
    type?: string
  }
}

export async function BlogListServer({ searchParams }: BlogListServerProps) {
  const params = {
    page: parseInt(searchParams.page || '1', 10),
    limit: 9,
    sort: (searchParams.sort || 'latest') as 'latest' | 'oldest',
    search: searchParams.search,
    type: searchParams.type
  }
  
  // Fetch current page data
  const data = await getBlogs(params)
  
  // Prefetch adjacent pages in background
  prefetchAdjacentPages(params)
  
  return (
    <BlogGridServer
      blogs={data.data}
      currentPage={data.currentPage}
      totalPages={data.lastPage}
      total={data.total}
      perPage={data.perPage}
      searchQuery={searchParams.search}
    />
  )
}