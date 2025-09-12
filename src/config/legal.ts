export const legalConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || '3YMode',
  lastUpdatedISO: process.env.NEXT_PUBLIC_LEGAL_LAST_UPDATED || new Date().toISOString(),
}

export function formatLastUpdated(locale?: string): string {
  const date = new Date(legalConfig.lastUpdatedISO)
  try {
    return new Intl.DateTimeFormat(locale || undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
  } catch {
    return legalConfig.lastUpdatedISO
  }
}
