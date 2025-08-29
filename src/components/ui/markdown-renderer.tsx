"use client"

import { memo } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { TrendingUp, BarChart3, LineChart, PieChart, Activity } from 'lucide-react'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function MarkdownSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
      <div className="h-6 bg-muted rounded w-2/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-4/5"></div>
      </div>
    </div>
  )
}

const MarkdownRendererComponent = memo(function MarkdownRendererComponent({ content, className = "" }: MarkdownRendererProps) {
  const components: Components = {
    h1: ({ children }) => <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-4 sm:mt-6 text-foreground">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 text-foreground">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base sm:text-lg font-bold mb-2 mt-3 sm:mt-4 text-foreground">{children}</h3>,
    h4: ({ children }) => <h4 className="text-sm sm:text-base font-bold mb-2 mt-2 sm:mt-3 text-foreground">{children}</h4>,
    h5: ({ children }) => <h5 className="text-sm sm:text-base font-semibold mb-2 mt-2 sm:mt-3 text-foreground">{children}</h5>,
    h6: ({ children }) => <h6 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 mt-2 text-foreground">{children}</h6>,
    p: ({ children }) => {
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
        return <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 text-foreground">{children}</h2>;
      }
      return <p className="text-sm sm:text-base leading-relaxed mt-0 mb-3 sm:mb-4 text-muted-foreground break-words">{children}</p>;
    },
    ul: ({ children }) => <ul className="text-sm sm:text-base space-y-1 sm:space-y-2 mb-3 sm:mb-4 pl-5 sm:pl-6 list-disc list-outside">{children}</ul>,
    ol: ({ children }) => <ol className="text-sm sm:text-base space-y-1 sm:space-y-2 mb-3 sm:mb-4 pl-5 sm:pl-6 list-decimal list-outside">{children}</ol>,
    li: ({ children }) => (
      <li className="leading-relaxed text-muted-foreground mb-2 break-words">
        {children}
      </li>
    ),
    strong: ({ children }) => <strong className="font-semibold text-foreground break-words">{children}</strong>,
    em: ({ children }) => <em className="italic break-words">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/20 pl-4 sm:pl-6 py-2 sm:py-3 mb-3 sm:mb-4 italic text-muted-foreground bg-muted/30 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-muted px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-mono" style={{ wordBreak: 'break-all' }}>{children}</code>
    ),
    pre: ({ children }) => {
      let content = '';
      if (typeof children === 'string') {
        content = children;
      } else if (children && typeof children === 'object' && 'props' in children) {
        const childProps = children as { props?: { children?: unknown } };
        content = String(childProps.props?.children || '');
      }
      const isAsciiTable = content.includes('|') && 
                         (content.includes('-') || content.includes('Year') || 
                          content.includes('Revenue') || content.includes('Growth') || 
                          content.includes('Multiple') || content.includes('MOIC'));
      
      if (isAsciiTable) {
        const lines = content.trim().split('\n').filter(line => line.trim() && line.includes('|'));
        const headerLine = lines.find(line => !line.includes('---') && line.includes('|'));
        const headers = headerLine ? 
          headerLine.split('|').map(h => h.trim()).filter(h => h) : 
          ['Column 1', 'Column 2', 'Column 3', 'Column 4'];
        
        const dataLines = lines.filter(line => 
          !line.includes('---') && 
          line !== headerLine &&
          line.split('|').filter(c => c.trim()).length > 1
        );
        
        if (dataLines.length > 0) {
          return (
            <div className="my-4 sm:my-6 -mx-4 sm:mx-0">
              <div className="overflow-x-auto px-4 sm:px-0">
                <table className="min-w-full divide-y divide-border/50 border border-border/50 rounded-xl">
                    <thead className="bg-muted/50">
                      <tr>
                        {headers.map((header, idx) => (
                          <th key={idx} className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border/50">
                      {dataLines.map((line, rowIdx) => {
                        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                        return (
                          <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                            {cells.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base text-muted-foreground">
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
          );
        }
      }
      
      return (
        <pre className="bg-muted p-2 sm:p-4 rounded-lg sm:rounded-xl overflow-x-auto mb-3 sm:mb-4 font-mono text-xs sm:text-sm max-w-full">
          {children}
        </pre>
      );
    },
    table: ({ children }) => (
      <div className="my-4 sm:my-6 -mx-4 sm:mx-0">
        <div className="overflow-x-auto px-4 sm:px-0">
          <table className="min-w-full divide-y divide-border/50 border border-border/50 rounded-xl table-auto">
            {children}
          </table>
        </div>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-background divide-y divide-border/50">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider whitespace-normal break-words" style={{ hyphens: 'auto' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base text-muted-foreground align-top whitespace-normal break-words" style={{ hyphens: 'auto' }}>
        {children}
      </td>
    ),
    hr: () => <hr className="my-6 border-border/50" />,
    img: ({ alt, src }) => {
      const altLower = alt?.toLowerCase() || '';
      const srcLower = typeof src === 'string' ? src.toLowerCase() : '';
      const isChart = altLower.includes('chart') || 
                     altLower.includes('projection') ||
                     altLower.includes('graph') ||
                     altLower.includes('moic') ||
                     srcLower.includes('chart');
      
      if (isChart) {
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
        
        return (
          <span className="block my-3 sm:my-4 p-4 sm:p-8 bg-gradient-to-br from-muted/20 to-muted/40 border border-border rounded-lg flex flex-col items-center justify-center">
            <ChartIcon className="h-10 w-10 sm:h-14 sm:w-14 text-muted-foreground/40 mb-2 sm:mb-3" />
            <span className="block text-xs sm:text-sm text-muted-foreground font-semibold">{alt || chartType}</span>
            <span className="block text-[10px] sm:text-xs text-muted-foreground/60 mt-1">Interactive chart would display here</span>
          </span>
        );
      }
      
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full h-auto rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    },
  }

  return (
    <div className={`prose prose-invert prose-zinc prose-sm sm:prose-base md:prose-lg max-w-full [&>*]:!max-w-full break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

// Dynamic import wrapper for lazy loading
const MarkdownRenderer = dynamic(
  () => Promise.resolve(MarkdownRendererComponent),
  {
    loading: () => <MarkdownSkeleton />,
    ssr: false // Only render on client to avoid SSR mismatch
  }
)

export default MarkdownRenderer
export { MarkdownSkeleton }