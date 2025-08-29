"use client"

import { useEffect, useRef, useState } from 'react'
import { BlogCard } from './blog-card'
import { Blog } from '@/types/blog'
import { Skeleton } from './skeleton'

interface BlogCardObserverProps {
  blog: Blog
  isAdmin?: boolean
}

export function BlogCardObserver({ blog, isAdmin = false }: BlogCardObserverProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = cardRef.current
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
            // Once visible, stop observing
            if (currentRef) {
              observer.unobserve(currentRef)
            }
          }
        })
      },
      {
        // Start loading when card is 100px away from viewport
        rootMargin: '100px',
        threshold: 0
      }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [isVisible])

  return (
    <div ref={cardRef} className="min-h-[200px]">
      {isVisible ? (
        <BlogCard blog={blog} isAdmin={isAdmin} />
      ) : (
        <BlogCardSkeleton />
      )}
    </div>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="h-full flex flex-col bg-muted/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2 mt-2" />
      </div>
      
      {/* Content Preview */}
      <div className="flex-1 mb-3 sm:mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      {/* Footer */}
      <div className="pt-3 sm:pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}