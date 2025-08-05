"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, TrendingUp, AlertTriangle, BarChart3, LineChart, PieChart, Activity } from 'lucide-react'
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
                      pre: ({ children }) => {
                        // Check if this is an ASCII table/chart
                        const content = String(children?.props?.children || children || '');
                        const isAsciiTable = content.includes('|') && 
                                           (content.includes('-') || content.includes('Year') || 
                                            content.includes('Revenue') || content.includes('Growth') || 
                                            content.includes('Multiple') || content.includes('MOIC'));
                        
                        if (isAsciiTable) {
                          // Parse the ASCII table and create a proper table
                          const lines = content.trim().split('\n').filter(line => line.trim() && line.includes('|'));
                          
                          // Try to extract headers from the first non-separator line
                          const headerLine = lines.find(line => !line.includes('---') && line.includes('|'));
                          const headers = headerLine ? 
                            headerLine.split('|').map(h => h.trim()).filter(h => h) : 
                            ['Column 1', 'Column 2', 'Column 3', 'Column 4'];
                          
                          // Extract data rows
                          const dataLines = lines.filter(line => 
                            !line.includes('---') && 
                            line !== headerLine &&
                            line.split('|').filter(c => c.trim()).length > 1
                          );
                          
                          if (dataLines.length > 0) {
                            return (
                              <div className="my-4 overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                  <div className="overflow-hidden border border-border rounded-lg">
                                    <table className="min-w-full divide-y divide-border">
                                      <thead className="bg-muted/50">
                                        <tr>
                                          {headers.map((header, idx) => (
                                            <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-background divide-y divide-border">
                                        {dataLines.map((line, rowIdx) => {
                                          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                                          return (
                                            <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                                              {cells.map((cell, cellIdx) => (
                                                <td key={cellIdx} className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                                  {cell}
                                                </td>
                                              ))}
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                        
                        // Regular code block
                        return (
                          <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3 font-mono text-xs">
                            {children}
                          </pre>
                        );
                      },
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto">
                          <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden border border-border rounded-lg shadow-sm">
                              <table className="min-w-full divide-y divide-border">
                                {children}
                              </table>
                            </div>
                          </div>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted/50">{children}</thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="bg-background divide-y divide-border">{children}</tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-r border-border last:border-r-0">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap border-r border-border last:border-r-0">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="my-4 border-border" />,
                      img: ({ alt, src }) => {
                        // Check if this is a chart placeholder
                        const altLower = alt?.toLowerCase() || '';
                        const srcLower = src?.toLowerCase() || '';
                        const isChart = altLower.includes('chart') || 
                                       altLower.includes('projection') ||
                                       altLower.includes('graph') ||
                                       altLower.includes('moic') ||
                                       srcLower.includes('chart');
                        
                        if (isChart) {
                          // Determine the appropriate chart icon based on the alt text
                          let ChartIcon = BarChart3;
                          let chartType = 'Chart Visualization';
                          
                          if (altLower.includes('line') || altLower.includes('projection') || altLower.includes('growth')) {
                            ChartIcon = LineChart;
                            chartType = 'Line Chart';
                          } else if (altLower.includes('pie') || altLower.includes('allocation') || altLower.includes('portfolio')) {
                            ChartIcon = PieChart;
                            chartType = 'Pie Chart';
                          } else if (altLower.includes('performance') || altLower.includes('metrics')) {
                            ChartIcon = Activity;
                            chartType = 'Performance Metrics';
                          } else if (altLower.includes('trend')) {
                            ChartIcon = TrendingUp;
                            chartType = 'Trend Analysis';
                          }
                          
                          // Show a nice chart placeholder instead of broken image
                          return (
                            <span className="block my-4 p-8 bg-gradient-to-br from-muted/20 to-muted/40 border border-border rounded-lg flex flex-col items-center justify-center">
                              <ChartIcon className="h-14 w-14 text-muted-foreground/40 mb-3" />
                              <span className="block text-sm text-muted-foreground font-semibold">{alt || chartType}</span>
                              <span className="block text-xs text-muted-foreground/60 mt-1">Interactive chart would display here</span>
                            </span>
                          );
                        }
                        
                        // For other images, try to render them normally but hide if broken
                        return (
                          <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => {
                              // Hide broken images
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        );
                      },
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