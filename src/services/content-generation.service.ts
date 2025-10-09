import { openai } from '@/lib/openai'
import { logger } from '@/lib/logger'

/**
 * Content Generation Service
 * Handles AI content generation and text processing
 */
export class ContentGenerationService {
  /**
   * Generates AI content using OpenAI
   */
  static async generateContent(systemPrompt: string): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Try Responses API with web search first for real-time market data
      try {
        logger.debug('Attempting Responses API with web_search_preview for newsletter generation')
        const response = await openai.responses.create({
          model: 'gpt-4o',
          input: systemPrompt,
          tools: [{ type: 'web_search_preview' }],
        })
        
        const duration = Date.now() - startTime
        logger.logService('ContentGeneration', 'generateWithWebSearch', true, duration, {
          model: 'gpt-4o',
          toolsUsed: ['web_search_preview']
        })
        
        // Clean the response to remove web search artifacts
        const rawContent = response.output_text || 'No response generated'
        return this.cleanWebSearchContent(rawContent)
      } catch (responsesError) {
        logger.warn('Responses API with web search failed, falling back to Chat Completions', {
          error: responsesError instanceof Error ? responsesError.message : 'Unknown error',
          duration: Date.now() - startTime
        })
        
        // Fallback to regular chat completions
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          temperature: 0.45,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt 
            },
            {
              role: 'user',
              content: ''
            }
          ],
          max_tokens: 8000,
        })
        
        const totalDuration = Date.now() - startTime
        logger.logService('ContentGeneration', 'generateWithChatCompletion', true, totalDuration, {
          model: 'gpt-4o',
          fallback: true
        })
        
        return completion.choices[0].message.content || 'No response generated'
      }
    } catch (error) {
      const totalDuration = Date.now() - startTime
      logger.logService('ContentGeneration', 'generateContent', false, totalDuration, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw new Error(`Failed to generate AI content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Cleans web search artifacts from content
   */
  static cleanWebSearchContent(content: string): string {
    let cleaned = content
    
    // Keep markdown links intact so the UI can surface sources. Strip footnote-style reference markers only.
    cleaned = cleaned.replace(/\[\d+\]/g, '')
    
    // Look for the Summary Judgment section and cut off anything after it
    const summaryJudgmentMatch = cleaned.match(/##?\s*Summary Judgment.*?\n\n.*?(?=\n\n##|\n\n[A-Z]|$)/s)
    if (summaryJudgmentMatch) {
      // Find where the Summary Judgment section ends (next section or excessive newlines)
      const summaryEndIndex = cleaned.indexOf(summaryJudgmentMatch[0]) + summaryJudgmentMatch[0].length
      
      // Check if there's content after that looks like web search additions
      const afterSummary = cleaned.substring(summaryEndIndex).trim()
      
      // If the content after contains patterns like "AI Initiatives", "Market Position", etc.
      // that aren't part of the standard framework sections, cut it off
      if (afterSummary && (
        afterSummary.includes('AI Initiative') ||
        afterSummary.includes('Market Position') ||
        afterSummary.includes('Latest News') ||
        afterSummary.includes('Recent Development') ||
        afterSummary.includes('Breaking:') ||
        afterSummary.includes('Update:') ||
        afterSummary.match(/^#{1,2}\s*[A-Z].*?:$/m) // Headers with colons that look like news sections
      )) {
        // Cut off everything after Summary Judgment
        cleaned = cleaned.substring(0, summaryEndIndex).trim()
      }
    }
    
    // Remove lines that start with common citation patterns
    const lines = cleaned.split('\n')
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim().toLowerCase()
      // Remove lines that are citations or metadata
      if (trimmedLine.startsWith('source:') || 
          trimmedLine.startsWith('citation:') ||
          trimmedLine.startsWith('reference:') ||
          trimmedLine.startsWith('stock market information for') ||
          trimmedLine.startsWith('market data from') ||
          trimmedLine.startsWith('data source:') ||
          trimmedLine.startsWith('retrieved from:') ||
          trimmedLine.startsWith('accessed:') ||
          trimmedLine.startsWith('via:') ||
          trimmedLine.startsWith('from:')) {
        return false
      }
      return true
    })
    
    cleaned = filteredLines.join('\n')
    
    // Remove any trailing metadata sections (usually after multiple newlines at the end)
    const parts = cleaned.split(/\n{3,}/)
    if (parts.length > 1) {
      // Check if the last part looks like metadata/citations or web search additions
      const lastPart = parts[parts.length - 1]
      const lastPartLower = lastPart.toLowerCase()
      if (lastPartLower.includes('source') || 
          lastPartLower.includes('citation') || 
          lastPartLower.includes('reference') ||
          lastPartLower.includes('stock market information') ||
          lastPartLower.includes('data from') ||
          lastPart.includes('Initiative') ||
          lastPart.includes('Latest') ||
          lastPart.includes('Breaking')) {
        parts.pop()
        cleaned = parts.join('\n\n')
      }
    }
    
    // Clean up any double periods that might result from removing domains
    cleaned = cleaned.replace(/\.\./g, '.')
    
    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')
    
    return cleaned.trim()
  }

  /**
   * Extracts company information from content for title generation
   */
  static extractCompanyInfo(text: string): string {
    // Look for patterns like "For APPLE (AAPL)" or "## What [Company Name] Does"
    const tickerMatch = text.match(/For\s+([A-Z][A-Za-z\s&]+)\s*\(([A-Z]+)\)/i)
    const companyMatch = text.match(/##\s*What\s+([A-Za-z\s&]+)\s+Does/i)
    
    if (tickerMatch) {
      return `${tickerMatch[1].trim()} (${tickerMatch[2]})`
    } else if (companyMatch) {
      return companyMatch[1].trim()
    }
    
    // Fallback: look for common company names in the content
    const companies = ['Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 'NVIDIA', 'Meta', 'Netflix']
    for (const company of companies) {
      if (text.includes(company)) {
        return company
      }
    }
    
    return 'Investment'
  }
}
