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
          <h1 className="text-3xl font-bold text-foreground mb-2">Investment Insights</h1>
          <p className="text-muted-foreground">AI-Powered Market Analysis</p>
        </div>
        
        {/* System Prompt Summary */}
        {systemPromptSummary && (
          <div className="mb-8 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
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
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground text-sm">
            © 2024 Weekly Digest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}