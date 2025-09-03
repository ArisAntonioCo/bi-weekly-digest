import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Blog } from '@/types/blog'
import { BlogCardObserver } from '@/components/ui/blog-card-observer'

export default async function SavedBlogsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Middleware should redirect unauthenticated users; render a fallback
    return (
      <div className="container mx-auto px-5 sm:px-6 py-10">
        <div className="text-center text-muted-foreground">Please sign in to view saved insights.</div>
      </div>
    )
  }

  // Fetch saved blog IDs
  const { data: savedRows } = await supabase
    .from('saved_blogs')
    .select('blog_id, created_at')
    .order('created_at', { ascending: false })

  const blogIds = (savedRows || []).map(r => r.blog_id)

  let blogs: Blog[] = []
  if (blogIds.length > 0) {
    const { data } = await supabase
      .from('blogs')
      .select('id,title,content,created_at')
      .in('id', blogIds)
      .order('created_at', { ascending: false })
    blogs = data || []
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-5 sm:px-6 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <BookmarkCheck className="h-6 w-6 text-primary" /> Saved Insights
              </h1>
              <p className="text-muted-foreground mt-1">Your bookmarked investment analyses</p>
            </div>
            <Link href="/blogs">
              <Button variant="ghost" className="rounded-full">Browse Insights</Button>
            </Link>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                <Bookmark className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No saved insights yet</h3>
              <p className="text-muted-foreground mt-1">Tap the bookmark icon on any analysis to save it here.</p>
              <div className="mt-6">
                <Link href="/blogs">
                  <Button variant="default" className="rounded-full">Explore Insights</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCardObserver key={blog.id} blog={blog} initialSaved={true} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
