import { cache } from 'react'
import { Blog } from '@/types/blog'
import { createClient } from '@/utils/supabase/server'

interface BlogQueryParams {
  page: number
  limit: number
  sort: 'latest' | 'oldest'
  search?: string
  type?: string
}

interface BlogResponse {
  data: Blog[]
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  next?: number
  prev?: number
}

// Use React cache for request-level memoization
// This deduplicates calls within the same request but doesn't persist across requests
export const getCachedSystemPromptSummary = cache(async (): Promise<string> => {
  const supabase = await createClient()
  
  const { data: config } = await supabase
    .from('configurations')
    .select('system_prompt')
    .single()

  if (!config?.system_prompt) return ''

  // This is a simplified version - in production you'd call OpenAI
  return 'AI-powered analysis and insights based on current system configuration.'
})

// Memoized version for deduplication within same request
export const getBlogs = cache(async (params: BlogQueryParams): Promise<BlogResponse> => {
  const supabase = await createClient()
  const { page, limit, sort, search, type } = params
  
  // Calculate offset
  const offset = (page - 1) * limit
  
  // Build query
  let query = supabase.from('blogs').select('*', { count: 'exact' })
  
  // Add search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }
  
  // Add type filter
  if (type && type !== 'all') {
    switch (type) {
      case 'moic':
        query = query.or('content.ilike.%moic%,content.ilike.%multiple on invested capital%')
        break
      case 'risk':
        query = query.or('content.ilike.%bear case%,content.ilike.%risk%')
        break
      case 'insight':
        query = query.not('content', 'ilike', '%moic%')
                    .not('content', 'ilike', '%bear case%')
                    .not('content', 'ilike', '%risk%')
        break
    }
  }
  
  // Get count first
  const { count: totalCount } = await query
  
  // Then get paginated results
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: sort === 'oldest' })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  
  const lastPage = Math.ceil((totalCount || 0) / limit)
  
  return {
    data: blogs || [],
    currentPage: page,
    perPage: limit,
    total: totalCount || 0,
    lastPage,
    next: page < lastPage ? page + 1 : undefined,
    prev: page > 1 ? page - 1 : undefined
  }
})

// Prefetch adjacent pages for faster navigation
export async function prefetchAdjacentPages(currentParams: BlogQueryParams) {
  const tasks = []
  
  // Prefetch next page
  if (currentParams.page < 10) { // Limit prefetching to first 10 pages
    tasks.push(
      getBlogs({
        ...currentParams,
        page: currentParams.page + 1
      })
    )
  }
  
  // Prefetch previous page if not on first page
  if (currentParams.page > 1) {
    tasks.push(
      getBlogs({
        ...currentParams,
        page: currentParams.page - 1
      })
    )
  }
  
  // Run prefetches in parallel but don't await
  Promise.all(tasks).catch(() => {
    // Silently fail prefetches
  })
}

// Get total count for filters (memoized)
export const getCachedTotalCount = cache(async (search?: string, type?: string): Promise<number> => {
  const supabase = await createClient()
  
  let query = supabase.from('blogs').select('*', { count: 'exact', head: true })
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }
  
  if (type && type !== 'all') {
    switch (type) {
      case 'moic':
        query = query.or('content.ilike.%moic%,content.ilike.%multiple on invested capital%')
        break
      case 'risk':
        query = query.or('content.ilike.%bear case%,content.ilike.%risk%')
        break
      case 'insight':
        query = query.not('content', 'ilike', '%moic%')
                    .not('content', 'ilike', '%bear case%')
                    .not('content', 'ilike', '%risk%')
        break
    }
  }
  
  const { count } = await query
  return count || 0
})