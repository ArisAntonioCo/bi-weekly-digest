"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'

interface Blog {
  id: string
  title: string
  content: string
  created_at: string
}

interface BlogListProps {
  blogs: Blog[]
}

export function BlogList({ blogs }: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Analysis Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Investment analysis will appear here once generated. The content is dynamically 
            created based on the current system prompt configuration.
          </p>
        </div>
      </div>
    )
  }

  const getAnalysisType = (content: string) => {
    if (content.toLowerCase().includes('moic') || content.toLowerCase().includes('multiple on invested capital')) {
      return { type: 'MOIC Analysis', variant: 'default' as const, icon: TrendingUp }
    }
    if (content.toLowerCase().includes('bear case') || content.toLowerCase().includes('risk')) {
      return { type: 'Risk Assessment', variant: 'destructive' as const, icon: AlertTriangle }
    }
    return { type: 'Investment Insight', variant: 'secondary' as const, icon: TrendingUp }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Latest Analysis</h2>
        <Badge variant="outline">{blogs.length} Post{blogs.length !== 1 ? 's' : ''}</Badge>
      </div>
      
      <div className="grid gap-6">
        {blogs.map((blog) => {
          const analysisType = getAnalysisType(blog.content)
          const Icon = analysisType.icon
          
          return (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg leading-tight">{blog.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <Badge variant={analysisType.variant} className="flex items-center gap-1 text-xs">
                        <Icon className="h-3 w-3" />
                        {analysisType.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-semibold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-3">{children}</h3>,
                      p: ({ children }) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="text-sm space-y-1 mb-2 ml-4">{children}</ul>,
                      ol: ({ children }) => <ol className="text-sm space-y-1 mb-2 ml-4">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      code: ({ children }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                      ),
                    }}
                  >
                    {blog.content.slice(0, 800) + (blog.content.length > 800 ? '...' : '')}
                  </ReactMarkdown>
                </div>
                
                {blog.content.length > 800 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Content truncated for preview. Full analysis available via API.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}