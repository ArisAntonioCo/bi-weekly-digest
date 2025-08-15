/**
 * Blog utility functions for content processing and analysis
 */

import { TrendingUp, AlertTriangle, LucideIcon } from 'lucide-react'

export interface AnalysisType {
  type: string
  variant: 'default' | 'destructive' | 'secondary'
  icon: LucideIcon
}

/**
 * Remove markdown formatting from text for preview display
 */
export function removeMarkdownFormatting(content: string): string {
  return content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines
    .replace(/\n/g, ' ') // Replace single newlines
    .trim()
}

/**
 * Extract preview text from content
 */
export function extractPreviewText(content: string, maxLength: number = 200): string {
  const plainText = removeMarkdownFormatting(content)
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  // Try to cut at a word boundary
  const cutoff = plainText.lastIndexOf(' ', maxLength)
  const finalCutoff = cutoff > maxLength * 0.8 ? cutoff : maxLength
  
  return plainText.substring(0, finalCutoff) + '...'
}

/**
 * Determine the analysis type based on content
 */
export function getAnalysisType(content: string): AnalysisType {
  const contentLower = content.toLowerCase()
  
  if (contentLower.includes('moic') || contentLower.includes('multiple on invested capital')) {
    return { 
      type: 'MOIC Analysis', 
      variant: 'default', 
      icon: TrendingUp 
    }
  }
  
  if (contentLower.includes('bear case') || contentLower.includes('risk')) {
    return { 
      type: 'Risk Assessment', 
      variant: 'destructive', 
      icon: AlertTriangle 
    }
  }
  
  return { 
    type: 'Investment Insight', 
    variant: 'secondary', 
    icon: TrendingUp 
  }
}

/**
 * Calculate estimated reading time for content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const words = content.split(/\s+/).filter(word => word.length > 0).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read'
  }
  return `${minutes} min read`
}

/**
 * Extract key metrics from blog content
 */
export function extractKeyMetrics(content: string): string[] {
  const metrics: string[] = []
  
  // Look for MOIC values (e.g., "3.5x MOIC")
  const moicMatch = content.match(/(\d+\.?\d*)[xX]\s*(?:MOIC|multiple)/i)
  if (moicMatch) {
    metrics.push(`${moicMatch[1]}x MOIC`)
  }
  
  // Look for percentage returns (e.g., "25% return")
  const returnMatch = content.match(/(\d+\.?\d*)%\s*(?:return|gain|upside)/i)
  if (returnMatch) {
    metrics.push(`${returnMatch[1]}% Return`)
  }
  
  // Look for price targets (e.g., "$150 target")
  const priceMatch = content.match(/\$(\d+\.?\d*)\s*(?:target|price)/i)
  if (priceMatch) {
    metrics.push(`$${priceMatch[1]} Target`)
  }
  
  return metrics.slice(0, 3) // Return max 3 metrics
}

/**
 * Get content summary from system prompt
 */
export function getSystemPromptSummary(systemPrompt: string): string {
  const lines = systemPrompt.split('\n').filter(line => line.trim())
  
  // Look for key indicators in the prompt
  const summaryLines = lines.filter(line => 
    line.includes('Framework') || 
    line.includes('Analysis') || 
    line.includes('Focus') ||
    line.includes('Strategy') ||
    line.includes('Investment')
  ).slice(0, 3)
  
  if (summaryLines.length > 0) {
    return summaryLines.join(' • ')
  }
  
  // Fallback to first meaningful line
  return lines.find(line => line.length > 20)?.substring(0, 100) || 'AI-Powered Investment Analysis'
}

/**
 * Check if content contains specific analysis sections
 */
export function getContentSections(content: string): string[] {
  const sections: string[] = []
  const contentLower = content.toLowerCase()
  
  if (contentLower.includes('bull case')) sections.push('Bull Case')
  if (contentLower.includes('bear case')) sections.push('Bear Case')
  if (contentLower.includes('catalyst')) sections.push('Catalysts')
  if (contentLower.includes('valuation')) sections.push('Valuation')
  if (contentLower.includes('technical analysis')) sections.push('Technical')
  if (contentLower.includes('risk')) sections.push('Risks')
  if (contentLower.includes('summary judgment')) sections.push('Summary')
  
  return sections
}

/**
 * Parse date from blog title or content
 */
export function extractBlogDate(title: string, content: string): Date | null {
  // Try to extract date from title first (e.g., "AI Investment Analysis - 1/15/2024")
  const titleDateMatch = title.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (titleDateMatch) {
    const [, month, day, year] = titleDateMatch
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  // Try to find date in content
  const contentDateMatch = content.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i)
  if (contentDateMatch) {
    return new Date(contentDateMatch[0])
  }
  
  return null
}