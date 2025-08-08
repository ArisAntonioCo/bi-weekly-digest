import { Skeleton } from '@/components/ui/skeleton'

export function BlogListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="group rounded-lg border border-border bg-card/50 p-6 space-y-4">
          <Skeleton className="h-5 w-20 bg-muted" />
          <Skeleton className="h-7 w-full bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-5/6 bg-muted" />
            <Skeleton className="h-4 w-4/6 bg-muted" />
          </div>
          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-8 w-20 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}