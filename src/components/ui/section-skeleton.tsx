export function SectionSkeleton() {
  return (
    <div className="w-full min-h-[400px] animate-pulse bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="h-8 bg-muted/30 rounded-lg w-1/3 mx-auto" />
          <div className="h-4 bg-muted/30 rounded-lg w-2/3 mx-auto" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 bg-muted/30 rounded-lg" />
            <div className="h-32 bg-muted/30 rounded-lg" />
            <div className="h-32 bg-muted/30 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}