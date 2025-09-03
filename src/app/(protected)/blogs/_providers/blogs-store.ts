"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { parseBlogsParams, BlogSort, BlogType } from '@/utils/query-params'

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
// One-way sync: URL -> store (avoid loops; pushing URL handled by page client code)
export function BlogsUrlSync() {
  const sp = useSearchParams()
  const { setSearch, setSort, setType, setPage } = useBlogsStore()

  useEffect(() => {
    const p = parseBlogsParams(sp)
    setSearch(p.search || '')
    setSort(p.sort || 'latest')
    setType((p.type || 'all') as BlogType)
    setPage(p.page || 1)
  }, [sp, setSearch, setSort, setType, setPage])

  return null
}
