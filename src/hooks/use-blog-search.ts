"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Blog } from '@/types/blog'
import { BlogFilterOptions } from '@/components/ui/blog-grid'

interface UseBlogSearchProps {
  initialPage?: number
  initialSort?: 'latest' | 'oldest'
  initialSearch?: string
  initialFilters?: BlogFilterOptions
  perPage?: number
}

interface UseBlogSearchReturn {
  blogs: Blog[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  total: number
  searchQuery: string
  sort: 'latest' | 'oldest'
  filters: BlogFilterOptions
  systemPromptSummary: string
  setPage: (page: number) => void
  setSort: (sort: 'latest' | 'oldest') => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: BlogFilterOptions) => void
  refresh: () => void
}

export function useBlogSearch({
  initialPage = 1,
  initialSort = 'latest',
  initialSearch = '',
  initialFilters = {},
  perPage = 9
}: UseBlogSearchProps = {}): UseBlogSearchReturn {
  const router = useRouter()
  
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sort, setSort] = useState<'latest' | 'oldest'>(initialSort)
  const [filters, setFilters] = useState<BlogFilterOptions>(initialFilters)
  const [systemPromptSummary, setSystemPromptSummary] = useState('')

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: perPage.toString(),
        sort,
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type)
      }

      const response = await fetch(`/api/blogs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }

      const data = await response.json()
      
      setBlogs(data.data || [])
      setTotalPages(data.lastPage || 1)
      setTotal(data.total || 0)
      setSystemPromptSummary(data.systemPromptSummary || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, sort, searchQuery, filters])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (currentPage > 1) params.set('page', currentPage.toString())
    if (sort !== 'latest') params.set('sort', sort)
    if (searchQuery) params.set('search', searchQuery)
    if (filters.type && filters.type !== 'all') params.set('type', filters.type)
    
    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname
    
    router.replace(newUrl, { scroll: false })
  }, [currentPage, sort, searchQuery, filters, router])

  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const refresh = useCallback(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // Wrap setters in useCallback for stable references
  const memoizedSetSort = useCallback((newSort: 'latest' | 'oldest') => {
    setSort(newSort)
  }, [])
  
  const memoizedSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])
  
  const memoizedSetFilters = useCallback((newFilters: BlogFilterOptions) => {
    setFilters(newFilters)
  }, [])

  return {
    blogs,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    searchQuery,
    sort,
    filters,
    systemPromptSummary,
    setPage,
    setSort: memoizedSetSort,
    setSearchQuery: memoizedSetSearchQuery,
    setFilters: memoizedSetFilters,
    refresh
  }
}