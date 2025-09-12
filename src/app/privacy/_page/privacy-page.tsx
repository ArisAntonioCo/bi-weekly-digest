import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { PrivacyContent } from '@/components/legal/privacy-content'
import { LegalLayout } from '@/components/legal/legal-layout'

export function PrivacyPage() {
  const toc = [
    { id: 'info-collect', label: 'Information We Collect' },
    { id: 'use-info', label: 'How We Use Info' },
    { id: 'sharing', label: 'Information Sharing' },
    { id: 'security', label: 'Data Security' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'cookies', label: 'Cookies & Tracking' },
  ]
  return (
    <LegalLayout title="Privacy Policy" toc={toc}>
      <PrivacyContent />
      <div className="mt-10" />
    </LegalLayout>
  )
}

export default PrivacyPage
