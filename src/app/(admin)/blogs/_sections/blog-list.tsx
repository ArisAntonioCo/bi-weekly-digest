"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
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
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 text-foreground">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5 text-foreground">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-4 text-foreground">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-sm font-bold mb-2 mt-3 text-foreground">{children}</h4>,
                      h5: ({ children }) => <h5 className="text-sm font-semibold mb-2 mt-3 text-foreground">{children}</h5>,
                      h6: ({ children }) => <h6 className="text-sm font-semibold mb-2 mt-2 text-foreground">{children}</h6>,
                      p: ({ children }) => {
                        // Check if this paragraph is actually a header-like text (no actual markdown header but should be)
                        const text = String(children);
                        if (text && typeof text === 'string' && 
                            (text === 'Narrative Summary' || 
                             text === 'AI Leverage' || 
                             text === 'Risk Vectors' || 
                             text === 'Valuation vs History' ||
                             text === 'Expert POV Overlay' ||
                             text === '3-Year MOIC Range' ||
                             text === 'Classification' ||
                             text.includes('3-Year MOIC') ||
                             text.includes('Core Features') ||
                             text.includes('Analysis'))) {
                          return <h2 className="text-lg font-bold mb-3 mt-5 text-foreground">{children}</h2>;
                        }
                        return <p className="text-sm leading-relaxed mb-3 text-muted-foreground">{children}</p>;
                      },
                      ul: ({ children }) => <ul className="text-sm space-y-1 mb-3 ml-5 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="text-sm space-y-1 mb-3 ml-5 list-decimal">{children}</ol>,
                      li: ({ children }) => (
                        <li className="leading-relaxed text-muted-foreground mb-1">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/20 pl-4 py-2 mb-3 italic text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3">
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className="w-full border-collapse border border-border">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted">{children}</thead>
                      ),
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => (
                        <tr className="border-b border-border">{children}</tr>
                      ),
                      th: ({ children }) => (
                        <th className="text-left p-2 font-semibold text-sm border-r border-border last:border-r-0">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="p-2 text-sm border-r border-border last:border-r-0">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="my-4 border-border" />,
                    }}
                  >
                    {blog.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}