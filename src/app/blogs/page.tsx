import { BlogListWrapper } from '@/components/blog-list-wrapper'
import { BlogSearchClient } from '@/components/blog-search-client'
import { getCachedSystemPromptSummary, getCachedTotalCount } from '@/lib/blog-cache'

interface BlogsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    sort?: string
    type?: string
  }>
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams
  
  // Fetch data in parallel using cached functions
  const [systemPromptSummary, totalCount] = await Promise.all([
    getCachedSystemPromptSummary(),
    getCachedTotalCount(params.search, params.type)
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