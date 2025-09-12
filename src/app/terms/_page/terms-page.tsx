import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { TermsContent } from '@/components/legal/terms-content'
import { LegalLayout } from '@/components/legal/legal-layout'

export function TermsPage() {
  const toc = [
    { id: 'acceptance', label: 'Acceptance of Terms' },
    { id: 'service', label: 'Service Description' },
    { id: 'disclaimer', label: 'Investment Disclaimer' },
    { id: 'accounts', label: 'User Accounts' },
    { id: 'prohibited', label: 'Prohibited Uses' },
    { id: 'liability', label: 'Limitation of Liability' },
  ]
  return (
    <LegalLayout title="Consumer Terms of Service" toc={toc}>
      <TermsContent />
      <div className="mt-10" />
    </LegalLayout>
  )
}

export default TermsPage
