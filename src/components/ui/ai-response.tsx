'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import '@/app/dashboard/moic-analyzer/katex-dark.css'

interface AIResponseProps {
  content: string
  className?: string
}

export function AIResponse({ content, className = '' }: AIResponseProps) {
  // Simple preprocessing - only convert brackets to dollar signs for display math
  const processedContent = React.useMemo(() => {
    let processed = content
    
    // Convert square bracket notation to double dollar signs for display math
    // Pattern: [ ... ] with LaTeX content inside
    processed = processed.replace(/\[\s*\n?\s*(\\[a-zA-Z]+.*?)\s*\n?\s*\]/gs, (match, equation) => {
      return `$$${equation}$$`
    })
    
    // Also handle inline bracket math if any
    processed = processed.replace(/\[\s*(\\[a-zA-Z]+[^[\]\n]+?)\s*\]/g, (match, equation) => {
      return `$$${equation}$$`
    })
    
    return processed
  }, [content])
  
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Headers
          h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-4 first:mt-0 text-zinc-100">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-zinc-100">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-zinc-100">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-medium mb-2 mt-2 first:mt-0 text-zinc-100">{children}</h4>,
          
          // Paragraphs and text
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-sm text-zinc-100">{children}</p>,
          
          // Lists
          ul: ({ children }) => <ul className="list-disc mb-3 space-y-1 pl-6 ml-2 text-sm text-zinc-100">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal mb-3 space-y-1 pl-6 ml-2 text-sm text-zinc-100">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed pl-1 text-zinc-100">{children}</li>,
          
          // Code blocks
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            return isInline ? (
              <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono text-zinc-300" {...props}>{children}</code>
            ) : (
              <code className="block bg-zinc-800 p-2 rounded text-xs font-mono overflow-x-auto text-zinc-300" {...props}>{children}</code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-zinc-800 p-3 rounded overflow-x-auto mb-3 text-zinc-300">{children}</pre>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-zinc-700 pl-4 mb-3 italic bg-zinc-800/50 py-2 text-zinc-300">
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full border-collapse border border-zinc-700">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-zinc-800">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-zinc-700">{children}</tr>,
          th: ({ children }) => <th className="border border-zinc-700 px-2 py-1 text-left text-xs font-semibold text-zinc-100">{children}</th>,
          td: ({ children }) => <td className="border border-zinc-700 px-2 py-1 text-xs text-zinc-100">{children}</td>,
          
          // Text formatting
          strong: ({ children }) => <strong className="font-semibold text-zinc-50">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          
          // Links
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          
          // Horizontal rule
          hr: () => <hr className="my-4 border-zinc-700" />,
          
          // Images (for diagrams and charts)
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="rounded-lg max-w-full h-auto my-3" />
          ),
        } as Components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}