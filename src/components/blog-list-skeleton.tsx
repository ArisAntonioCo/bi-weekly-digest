import { Skeleton } from '@/components/ui/skeleton'

export function BlogListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-[300px] bg-zinc-800" />
        <Skeleton className="h-6 w-32 bg-zinc-800" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full bg-zinc-800 rounded-lg" />
            <Skeleton className="h-6 w-3/4 bg-zinc-800" />
            <Skeleton className="h-4 w-full bg-zinc-800" />
            <Skeleton className="h-4 w-2/3 bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}