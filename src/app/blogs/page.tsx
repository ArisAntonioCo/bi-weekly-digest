import { BlogListWrapper } from '@/components/blog-list-wrapper'
import { BlogSearchClient } from '@/components/blog-search-client'

interface BlogsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    sort?: string
    type?: string
  }>
}

async function getSystemPromptSummary() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blogs?page=1&limit=1`,
      { cache: 'no-store' }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.systemPromptSummary || null
  } catch {
    return null
  }
}

type SearchParams = {
  page?: string
  search?: string
  sort?: string
  type?: string
}

async function getTotalCount(searchParams: SearchParams) {
  try {
    const params = new URLSearchParams({
      page: '1',
      limit: '1',
      ...(searchParams.search && { search: searchParams.search }),
      ...(searchParams.type && { type: searchParams.type })
    })
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blogs?${params}`,
      { cache: 'no-store' }
    )
    
    if (!response.ok) return 0
    
    const data = await response.json()
    return data.total || 0
  } catch {
    return 0
  }
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams
  const [systemPromptSummary, totalCount] = await Promise.all([
    getSystemPromptSummary(),
    getTotalCount(params)
  ])

  return (
    <div>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Investment Insights</h1>
          <p className="text-zinc-400">AI-Powered Market Analysis</p>
        </div>
        
        {/* System Prompt Summary */}
        {systemPromptSummary && (
          <div className="mb-8 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700">
            <p className="text-sm text-zinc-300 text-center">
              {systemPromptSummary}
            </p>
          </div>
        )}

        {/* Blog Content with Search and Suspense */}
        <BlogSearchClient totalCount={totalCount}>
          <BlogListWrapper searchParams={params} />
        </BlogSearchClient>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-zinc-500 text-sm">
            © 2024 Weekly Digest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}