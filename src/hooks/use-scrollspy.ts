"use client"

import { useEffect, useMemo, useState } from 'react'

export function useScrollSpy(ids: string[], options?: IntersectionObserverInit) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const rootMargin = useMemo(() => options?.rootMargin ?? '-40% 0px -55% 0px', [options?.rootMargin])
  const thresholdValue = useMemo(() => options?.threshold ?? [0, 1], [options?.threshold])

  useEffect(() => {
    const elements = ids
      .map((id) => (typeof document !== 'undefined' ? document.getElementById(id) : null))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin,
        threshold: Array.isArray(thresholdValue) ? thresholdValue : [thresholdValue as number],
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, rootMargin, thresholdValue])

  return activeId
}
