"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BlogsParams, parseBlogsParams, blogsParamsToQuery, BlogSort, BlogType } from '@/utils/query-params'

type BlogsState = {
  search: string
  sort: BlogSort
  type: BlogType
  page: number
  isFiltersOpen: boolean
  setSearch: (v: string) => void
  setSort: (v: BlogSort) => void
  setType: (v: BlogType) => void
  setPage: (v: number) => void
  setFiltersOpen: (v: boolean) => void
}

export const useBlogsStore = create<BlogsState>()(
  persist(
    (set) => ({
      search: '',
      sort: 'latest',
      type: 'all',
      page: 1,
      isFiltersOpen: false,
      setSearch: (v) => set({ search: v, page: 1 }),
      setSort: (v) => set({ sort: v, page: 1 }),
      setType: (v) => set({ type: v, page: 1 }),
      setPage: (v) => set({ page: Math.max(1, v) }),
      setFiltersOpen: (v) => set({ isFiltersOpen: v }),
    }),
    { name: 'blogs-ui' }
  )
)

// Optional URL sync helper to be used in page client leaves
export function BlogsUrlSync() {
  const router = useRouter()
  const sp = useSearchParams()
  const params = parseBlogsParams(sp)
  const { search, sort, type, page, setSearch, setSort, setType, setPage } = useBlogsStore()

  // Hydrate from URL on mount
  useEffect(() => {
    setSearch(params.search || '')
    setSort(params.sort || 'latest')
    setType((params.type || 'all') as BlogType)
    setPage(params.page || 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push URL when key params change
  useEffect(() => {
    const current: Partial<BlogsParams> = parseBlogsParams(sp)
    const next: Partial<BlogsParams> = { search, sort, type, page }
    // Avoid loops: only update when values differ
    if (
      current.search === next.search &&
      current.sort === next.sort &&
      (current.type || 'all') === (next.type || 'all') &&
      (current.page || 1) === (next.page || 1)
    ) {
      return
    }
    const q = blogsParamsToQuery(next)
    const url = q ? `/blogs?${q}` : '/blogs'
    router.replace(url)
  }, [search, sort, type, page, router, sp])

  return null
}
