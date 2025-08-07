import { Skeleton } from '@/components/ui/skeleton'

export function BlogListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <Skeleton className="h-5 w-20 bg-zinc-800" />
          <Skeleton className="h-7 w-full bg-zinc-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-zinc-800" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800" />
            <Skeleton className="h-4 w-4/6 bg-zinc-800" />
          </div>
          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-8 w-20 bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}