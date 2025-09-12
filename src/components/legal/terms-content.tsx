export function TermsContent() {
  return (
    <div className="max-w-none">
      <section className="mb-6">
        <h2 id="acceptance" className="text-lg md:text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          By accessing and using our services, you accept and agree to be bound by these Terms.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="service" className="text-lg md:text-xl font-semibold text-foreground mb-2">2. Service Description</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          We provide investment insights, market analysis, and educational content.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="disclaimer" className="text-lg md:text-xl font-semibold text-foreground mb-2">3. Investment Disclaimer</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          Information is provided for educational purposes only and is not financial advice. All investments carry risk.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="accounts" className="text-lg md:text-xl font-semibold text-foreground mb-2">4. User Accounts</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your password</li>
          <li>Notify us of unauthorized use</li>
        </ul>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="prohibited" className="text-lg md:text-xl font-semibold text-foreground mb-2">5. Prohibited Uses</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Sharing credentials or redistributing content</li>
          <li>Unlawful use or attempting unauthorized access</li>
          <li>Interfering with or disrupting the service</li>
        </ul>
      </section>

      <section className="border-t pt-6">
        <h2 id="liability" className="text-lg md:text-xl font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground">
          To the maximum extent permitted by law, we are not liable for indirect or consequential damages.
        </p>
      </section>
    </div>
  )
}
