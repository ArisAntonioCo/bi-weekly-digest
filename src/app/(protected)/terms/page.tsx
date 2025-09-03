import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-4xl">
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              By accessing and using 3YMode&apos;s services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              2. Service Description
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              3YMode provides investment insights, market analysis, and financial information through 
              our bi-weekly newsletter service. Our content includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Expert-grade 3Y MOIC projections</li>
              <li>Market analysis and trends</li>
              <li>Investment insights based on proven frameworks</li>
              <li>Educational content about financial markets</li>
            </ul>
            <p className="text-base text-muted-foreground mt-4">
              <strong className="text-foreground">Important:</strong> Our service provides information for educational purposes only 
              and does not constitute financial advice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              3. Investment Disclaimer
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">Not Financial Advice:</strong> The information provided through 3YMode is for 
              informational and educational purposes only and should not be construed as financial, 
              investment, tax, or legal advice.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">Risk Disclosure:</strong> All investments carry risk, including the potential 
              loss of principal. Past performance does not guarantee future results. You should conduct 
              your own research and consult with qualified professionals before making any investment decisions.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">No Guarantees:</strong> We do not guarantee the accuracy, completeness, or 
              timeliness of any information provided. Market projections are based on analysis and are 
              subject to change without notice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              4. User Accounts
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              To access certain features of our service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              5. Subscription and Billing
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">Free Trial:</strong> We offer a free trial period for new users. After the trial 
              period, your subscription will automatically convert to a paid subscription unless cancelled.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">Billing:</strong> Subscriptions are billed on a recurring basis. By subscribing, 
              you authorize us to charge your payment method on each billing cycle.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">Cancellation:</strong> You may cancel your subscription at any time. Cancellation 
              will take effect at the end of the current billing period.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              <strong className="text-foreground">Refunds:</strong> We offer a 30-day money-back guarantee for new subscribers. 
              After this period, subscriptions are non-refundable.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              All content provided through 3YMode, including text, graphics, logos, and software, is 
              the property of 3YMode or its content suppliers and is protected by intellectual property laws.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              You may not reproduce, distribute, modify, or create derivative works from any content 
              without our prior written permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              7. Prohibited Uses
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
              <li>Share your account credentials with others</li>
              <li>Redistribute our content without permission</li>
              <li>Use our service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated systems to access the service</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              To the maximum extent permitted by law, 3YMode shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including loss of profits, data, 
              or other intangible losses resulting from your use of our service.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              In no event shall our total liability exceed the amount paid by you for the service in 
              the twelve months preceding the claim.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              9. Indemnification
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              You agree to indemnify and hold harmless 3YMode, its affiliates, and their respective 
              officers, directors, employees, and agents from any claims, damages, losses, or expenses 
              arising from your use of the service or violation of these terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              10. Modifications to Terms
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through the service. Your continued use of the service 
              after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              11. Termination
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason, including breach of these Terms.
            </p>
            <p className="text-base text-muted-foreground mb-4">
              Upon termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              12. Governing Law
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your 
              Jurisdiction], without regard to its conflict of law provisions.
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