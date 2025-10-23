import { DISCLAIMER_PARAGRAPHS, DISCLAIMER_HEADING } from '@/config/disclaimer'

export function TermsContent() {
  return (
    <div className="max-w-none">
      <section className="mb-6">
        <h2 id="acceptance" className="text-lg md:text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          By accessing and using our services, you confirm that you are at least 18 years old and agree to comply with and be legally bound by these Terms.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="service" className="text-lg md:text-xl font-semibold text-foreground mb-2">2. Service Description</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          We provide investment insights, market analysis, and educational content to help users develop long-term investment strategies.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="disclaimer" className="text-lg md:text-xl font-semibold text-foreground mb-2">3. Investment Disclaimer</h2>
        <div className="text-sm md:text-base leading-7 text-muted-foreground mb-3 space-y-3">
          <p className="font-semibold text-foreground">{DISCLAIMER_HEADING}</p>
          {DISCLAIMER_PARAGRAPHS.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="accounts" className="text-lg md:text-xl font-semibold text-foreground mb-2">4. User Accounts</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your password</li>
          <li>Notify us of unauthorized use</li>
        </ul>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mt-3">
          We reserve the right to suspend or terminate accounts for suspicious, abusive, or non-compliant behavior.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="prohibited" className="text-lg md:text-xl font-semibold text-foreground mb-2">5. Prohibited Uses</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Resell, redistribute, or share your access credentials or our content without permission</li>
          <li>Use our service for unlawful purposes</li>
          <li>Interfere with or disrupt our systems, servers, or networks</li>
          <li>Reverse-engineer or attempt to derive the source code of our platform</li>
          <li>Upload malicious code or engage in phishing, scraping, or spam</li>
        </ul>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="liability" className="text-lg md:text-xl font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground">
          To the maximum extent permitted by law, we are not liable for indirect or consequential damages.
        </p>
      </section>

      <section className="border-t pt-6">
        <h2 id="contact" className="text-lg md:text-xl font-semibold text-foreground mb-2">7. Contact</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground">
          Questions? Reach out to _____
        </p>
      </section>
    </div>
  )
}
