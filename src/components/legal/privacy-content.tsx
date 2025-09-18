export function PrivacyContent() {
  return (
    <div className="max-w-none">
      <section className="mb-6">
        <h2 id="info-collect" className="text-lg md:text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          We collect information you provide directly to us, such as when you create an account,
          subscribe to our newsletter, or contact us for support.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Account information (name, email address, password)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Communication preferences</li>
          <li>Feedback and correspondence</li>
          <li>Investment preferences and usage data</li>
        </ul>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="use-info" className="text-lg md:text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Provide, maintain, and improve our services</li>
          <li>Send you investment insights and market analysis</li>
          <li>Process transactions and send related information</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions</li>
        </ul>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="sharing" className="text-lg md:text-xl font-semibold text-foreground mb-2">3. Information Sharing</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          We do not sell, trade, or otherwise transfer your personal information to third parties.
          We may share your information only in the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>With your explicit consent or at your direction</li>
          <li>To comply with legal and regulatory obligations</li>
          <li>To protect the rights, property, and safety of our company and users</li>
          <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
        </ul>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="security" className="text-lg md:text-xl font-semibold text-foreground mb-2">4. Data Security</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mb-3">
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section className="mb-6 border-t pt-6">
        <h2 id="rights" className="text-lg md:text-xl font-semibold text-foreground mb-2">5. Your Rights</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-muted-foreground">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt out of marketing communications</li>
          <li>Data portability</li>
        </ul>
        <p className="text-sm md:text-base leading-7 text-muted-foreground mt-3">
          To exercise these rights, contact us at: ______
        </p>
      </section>

      <section className="border-t pt-6">
        <h2 id="cookies" className="text-lg md:text-xl font-semibold text-foreground mb-2">6. Cookies and Tracking</h2>
        <p className="text-sm md:text-base leading-7 text-muted-foreground">
          We use cookies and similar technologies to provide and improve our services.
          You can control cookies through your browser settings.
        </p>
      </section>
    </div>
  )
}
