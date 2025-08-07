import { BlogGridServer } from './blog-grid-server'

async function fetchBlogs(searchParams: {
  page?: string
  search?: string
  sort?: string
  type?: string
}) {
  const params = new URLSearchParams({
    page: searchParams.page || '1',
    limit: '9',
    sort: searchParams.sort || 'latest',
    ...(searchParams.search && { search: searchParams.search }),
    ...(searchParams.type && { type: searchParams.type })
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blogs?${params}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch blogs')
  }

  return response.json()
}

interface BlogListServerProps {
  searchParams: {
    page?: string
    search?: string
    sort?: string
    type?: string
  }
}

export async function BlogListServer({ searchParams }: BlogListServerProps) {
  const data = await fetchBlogs(searchParams)
  
  return (
    <BlogGridServer
      blogs={data.data || []}
      currentPage={data.currentPage || 1}
      totalPages={data.lastPage || 1}
      total={data.total || 0}
      perPage={9}
      searchQuery={searchParams.search}
    />
  )
}