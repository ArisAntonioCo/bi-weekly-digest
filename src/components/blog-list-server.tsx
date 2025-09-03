import { BlogGridServer } from './blog-grid-server'
import { createClient } from '@/utils/supabase/server'
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

  // Fetch saved status in one query for current user
  let savedIds: string[] | undefined
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const ids = (data.data || []).map(b => b.id)
      if (ids.length > 0) {
        const { data: savedRows } = await supabase
          .from('saved_blogs')
          .select('blog_id')
          .in('blog_id', ids)
        savedIds = (savedRows || []).map(r => r.blog_id)
      }
    }
  } catch {}
  
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
      savedIds={savedIds}
    />
  )
}
