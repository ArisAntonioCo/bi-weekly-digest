import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlogList } from '@/components/ui/blog-list'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/server'

interface BlogDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // Fetch the blog post
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !blog) {
    notFound()
  }

  // Calculate reading time
  const words = blog.content.split(/\s+/).length
  const readingTime = Math.ceil(words / 200)

  // Determine analysis type
  const getAnalysisType = (content: string) => {
    const contentLower = content.toLowerCase()
    if (contentLower.includes('moic') || contentLower.includes('multiple on invested capital')) {
      return { type: 'MOIC Analysis', variant: 'default' as const }
    }
    if (contentLower.includes('bear case') || contentLower.includes('risk')) {
      return { type: 'Risk Assessment', variant: 'destructive' as const }
    }
    return { type: 'Investment Insight', variant: 'secondary' as const }
  }

  const analysisType = getAnalysisType(blog.content)

  // Fetch related blogs (same type, different post)
  const { data: relatedBlogs } = await supabase
    .from('blogs')
    .select('id, title, created_at')
    .neq('id', resolvedParams.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/blogs">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Insights
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <div className="bg-zinc-100 text-zinc-900 flex size-6 items-center justify-center rounded-md">
                  <TrendingUp className="size-4" />
                </div>
                <span className="text-sm font-medium text-zinc-100">Weekly Digest</span>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={analysisType.variant}>
              {analysisType.type}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(blog.created_at), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} min read
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">
            {blog.title}
          </h1>
        </div>

        {/* Blog Content */}
        <article className="prose prose-invert prose-zinc max-w-none">
          <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8">
            <BlogList blogs={[blog]} />
          </div>
        </article>

        {/* Related Posts */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Related Insights</h2>
            <div className="space-y-4">
              {relatedBlogs.map((related) => (
                <Link 
                  key={related.id} 
                  href={`/blogs/${related.id}`}
                  className="block group"
                >
                  <div className="p-4 bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-zinc-100 group-hover:text-zinc-300 transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {format(new Date(related.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-zinc-500 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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