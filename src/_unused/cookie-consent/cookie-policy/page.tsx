import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - Weekly Digest',
  description: 'Learn about how we use cookies to improve your experience on our investment intelligence platform',
}

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our platform, and enabling certain functionalities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>
            We use cookies on our investment intelligence platform to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Keep you signed in to your account</li>
            <li>Remember your investment preferences and settings</li>
            <li>Analyze how you interact with our platform to improve our services</li>
            <li>Provide personalized investment insights based on your interests</li>
            <li>Ensure the security of your account and data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
          
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Strictly Necessary Cookies</h3>
              <p className="mb-3">
                These cookies are essential for the website to function properly. They enable core features like user authentication and account management.
              </p>
              <div className="bg-background rounded p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">sb-*</td>
                      <td className="py-2">Supabase authentication</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2">bi_weekly_cookie_consent</td>
                      <td className="py-2">Stores your cookie preferences</td>
                      <td className="py-2">6 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Analytics Cookies</h3>
              <p className="mb-3">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <div className="bg-background rounded p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics - Distinguishes unique users</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2">_gid</td>
                      <td className="py-2">Google Analytics - Distinguishes users</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Marketing Cookies</h3>
              <p className="mb-3">
                These cookies are used to track visitors across websites to display ads that are relevant and engaging for individual users.
              </p>
              <div className="bg-background rounded p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">_fbp</td>
                      <td className="py-2">Meta Pixel - Used for advertising</td>
                      <td className="py-2">3 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Your Cookie Preferences</h2>
          <p>
            You can manage your cookie preferences at any time by clicking the "Cookie Settings" button that appears at the bottom of any page on our website. You can also manage cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/help/4027947/microsoft-edge-delete-cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Edge</a></li>
          </ul>
          <p className="mt-4">
            Please note that disabling certain cookies may impact the functionality of our website and limit your ability to use some features.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
          <p>
            We may use third-party services that set their own cookies. These services include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
            <li><strong>Supabase:</strong> For authentication and database services</li>
            <li><strong>Meta (Facebook):</strong> For advertising and marketing purposes (when enabled)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <p>Email: privacy@biweeklydigest.com</p>
            <p>Address: Your Company Address Here</p>
          </div>
        </section>
      </div>
    </div>
  )
}