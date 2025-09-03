import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/server'
import { BlogViewTracker } from './blog-view-tracker'
import { Suspense } from 'react'
import { BlogContent } from './blog-content'
import { SaveToggle } from '@/components/ui/save-toggle'

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

  // Determine initial saved state for faster icon paint
  const { count: savedCount } = await supabase
    .from('saved_blogs')
    .select('id', { count: 'exact', head: true })
    .eq('blog_id', resolvedParams.id)

  // Fetch related blogs (same type, different post)
  const { data: relatedBlogs } = await supabase
    .from('blogs')
    .select('id, title, created_at')
    .neq('id', resolvedParams.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Track blog view */}
      <BlogViewTracker blogId={resolvedParams.id} />
      
      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blogs">
            <Button 
              variant="ghost" 
              size="lg" 
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Insights
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge 
              variant="default"
              className="rounded-full px-4 py-1 text-sm font-medium"
            >
              {analysisType.type}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(blog.created_at), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} min read
              </span>
            </div>
            <SaveToggle blogId={resolvedParams.id} initialSaved={(savedCount || 0) > 0} />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {blog.title}
          </h1>
        </div>

        {/* Blog Content */}
        <article className="w-full overflow-x-hidden">
          <Suspense fallback={
            <div className="bg-muted/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          }>
            <BlogContent blog={blog} />
          </Suspense>
        </article>

        {/* Related Posts */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/50">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">Related Insights</h2>
            <div className="space-y-3">
              {relatedBlogs.map((related) => (
                <Link 
                  key={related.id} 
                  href={`/blogs/${related.id}`}
                  className="block group"
                >
                  <div className="p-4 sm:p-6 bg-muted/50 rounded-2xl sm:rounded-3xl hover:bg-muted/70 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(related.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center text-muted-foreground text-sm">
            © 2024 Weekly Digest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
