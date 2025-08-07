'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useCallback } from 'react'
import { BlogPagination } from '@/components/ui/blog-pagination'

interface BlogPaginationServerProps {
  currentPage: number
  totalPages: number
  total: number
  perPage: number
}

export function BlogPaginationServer({
  currentPage,
  totalPages,
  total,
  perPage
}: BlogPaginationServerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    
    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    
    startTransition(() => {
      router.push(url, { scroll: true })
    })
  }, [searchParams, pathname, router])

  return (
    <div className={isPending ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
      <BlogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}