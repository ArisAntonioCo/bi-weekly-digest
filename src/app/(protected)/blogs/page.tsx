import { BlogListWrapper } from '@/components/blog-list-wrapper'
import { BlogSearchClient } from '@/components/blog-search-client'
import { BlogsUrlSync } from './_providers/blogs-store'
import { getCachedSystemPromptSummary, getCachedTotalCount } from '@/lib/blog-cache'
import { DISCLAIMER_SHORT } from '@/config/disclaimer'

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
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-5 sm:px-6 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Investment Insights</h1>
            <p className="text-muted-foreground mt-1">Drawing from Gurley, Meeker, Druckenmiller, and more</p>
            <p className="text-xs text-muted-foreground mt-3 max-w-3xl">
              {DISCLAIMER_SHORT}
            </p>
          </div>
          
          {/* System Prompt Summary - Simplified */}
          {systemPromptSummary && (
            <div className="mb-8 p-4 bg-muted/30 rounded-2xl">
              <p className="text-sm text-muted-foreground text-center">
                {systemPromptSummary}
              </p>
            </div>
          )}

          {/* URL ↔ UI sync for blogs filters/sort/page */}
          <BlogsUrlSync />

          {/* Blog Content with Search and Suspense */}
          <BlogSearchClient totalCount={totalCount}>
            <BlogListWrapper searchParams={params} />
          </BlogSearchClient>
        </div>
      </main>
    </div>
  )
}
