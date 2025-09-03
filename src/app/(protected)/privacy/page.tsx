import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-4xl">
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              1. Information We Collect
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              subscribe to our newsletter, or contact us for support.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Account information (name, email address, password)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Communication preferences</li>
              <li>Feedback and correspondence</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Send you investment insights and market analysis</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              3. Information Sharing
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>With your consent or at your direction</li>
              <li>To comply with legal obligations</li>
              <li>To protect the rights, property, and safety of 3YMode and our users</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              4. Data Security
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information by employees</li>
              <li>Secure data storage using industry-standard providers</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              5. Your Rights
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              6. Cookies and Tracking
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold 
              certain information. You can instruct your browser to refuse all cookies or to indicate 
              when a cookie is being sent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              7. Children&apos;s Privacy
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              Our service is not directed to individuals under the age of 18. We do not knowingly collect 
              personal information from children under 18.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
            </p>
          </section>

        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Ready to get started?
          </h3>
          <Link href="/signup">
            <Button variant="default" size="lg" className="rounded-full">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}