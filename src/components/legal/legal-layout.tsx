"use client"
import { formatLastUpdated } from '@/config/legal'
import { useMemo } from 'react'
import { useScrollSpy } from '@/hooks/use-scrollspy'
import { Clock } from 'lucide-react'

interface TocItem {
  id: string
  label: string
}

interface LegalLayoutProps {
  title: string
  toc: TocItem[]
  previousUrl?: string
  children: React.ReactNode
}

export function LegalLayout({ title, toc, previousUrl, children }: LegalLayoutProps) {
  const ids = useMemo(() => toc.map((t) => t.id), [toc])
  const activeId = useScrollSpy(ids)
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 md:py-14">
        <header className="text-center">
          <h1 className="font-bold tracking-tight text-4xl sm:text-5xl md:text-7xl text-foreground">{title}</h1>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm md:text-base">
            <span className="font-semibold text-foreground">Effective {formatLastUpdated()}</span>
            {previousUrl && (
              <a href={previousUrl} className="underline underline-offset-4 text-foreground hover:text-primary">
                Previous Version
              </a>
            )}
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              1 min read
            </span>
          </div>
          <hr className="mt-6 border-border" />
        </header>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-8">
          <aside className="hidden md:block">
            <nav className="sticky top-24">
              <ul className="space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`transition-colors ${activeId === item.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <main className="md:min-w-0">
            <div className="max-w-2xl md:max-w-3xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
