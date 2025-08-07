import { Suspense } from 'react'
import { BlogListServer } from './blog-list-server'
import { BlogListSkeleton } from './blog-list-skeleton'

interface BlogListWrapperProps {
  searchParams: {
    page?: string
    search?: string
    sort?: string
    type?: string
  }
}

export function BlogListWrapper({ searchParams }: BlogListWrapperProps) {
  return (
    <Suspense 
      key={JSON.stringify(searchParams)} 
      fallback={<BlogListSkeleton />}
    >
      <BlogListServer searchParams={searchParams} />
    </Suspense>
  )
}