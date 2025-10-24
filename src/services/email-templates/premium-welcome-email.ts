const DEFAULT_BASE_URL = 'https://3ymode.vercel.app'
const DEFAULT_SESSION_URL = 'mailto:team@3ymode.com?subject=Schedule%20a%203YMode%20Premium%20Dashboard'

export interface PremiumWelcomeEmailPayload {
  recipientEmail: string
}

function resolveBaseUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL
  if (!candidate) return DEFAULT_BASE_URL

  try {
    const parsed = new URL(candidate)
    const hostname = parsed.hostname.toLowerCase()

    // Avoid using localhost/127.* domains in emails since they are not internet-accessible
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname === '[::1]') {
      return DEFAULT_BASE_URL
    }

    return parsed.toString()
  } catch {
    return DEFAULT_BASE_URL
  }
}

function buildUrl(path: string, baseUrl: string, fallback: string) {
  try {
    return new URL(path, baseUrl).toString()
  } catch {
    return fallback
  }
}

function resolveSessionUrl() {
  const configured = process.env.NEXT_PUBLIC_PREMIUM_SESSION_URL
  if (!configured) return DEFAULT_SESSION_URL

  try {
    const url = new URL(configured)
    return url.toString()
  } catch {
    return DEFAULT_SESSION_URL
  }
}

export function buildPremiumWelcomeEmail({
  recipientEmail,
}: PremiumWelcomeEmailPayload) {
  const baseUrl = resolveBaseUrl()
  const dashboardUrl = buildUrl('/dashboard', baseUrl, `${baseUrl}/dashboard`)
  const intelligenceUrl = buildUrl('/expert-analysis', baseUrl, `${baseUrl}/expert-analysis`)
  const sessionUrl = resolveSessionUrl()
  const logoUrl = buildUrl('/3YMode.png', baseUrl, 'https://3ymode.vercel.app/3YMode.png')

  const safeRecipient = recipientEmail?.trim() || 'your email'

  const subject = 'Welcome to 3YMode Premium Insights'
  const premiumBanner = `
<div style="padding: 32px 28px; border-radius: 16px; border: 1px solid #e5e7eb; background: linear-gradient(135deg, rgba(46, 231, 0, 0.08), rgba(46, 231, 0, 0)); text-align: center; margin-bottom: 32px;">
  <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
    <img src="${logoUrl}" alt="3YMode Logo" style="height: 40px; width: auto; display: block;" />
    <span style="font-size: 20px; font-weight: 700; letter-spacing: 0.02em; color: #111827;">Premium Insights</span>
  </div>
  <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Your expert-grade onboarding is live.</p>
  <p style="margin: 12px auto 0; max-width: 520px; font-size: 14px; line-height: 1.7; color: #4b5563;">
    We build this intelligence into private dashboards. Explore the same workspace our fund and growth-operator clients rely on—no attachments required.
  </p>
</div>`

  const markdown = `
${premiumBanner}

# Welcome to 3YMode Premium Insights

Hi there,

Thank you for joining 3YMode. We typically deliver this intelligence in a PDF, but we wanted you to experience it the way our clients do—inside a private, always-on dashboard.

---

## Inside Your Premium Workspace

- **3-Year MOIC Forecasts** tuned to the expert frameworks we reference from Bill Gurley, Brad Gerstner, Stanley Druckenmiller, Mary Meeker, and Beth Kindig.
- **Durability Diagnostics** that highlight the risk posture of each asset and the warning signals we monitor week to week.
- **Scenario Controls** so you can stress-test bear, base, and bull cases without leaving the model.

[Open Your Dashboard →](${dashboardUrl})

---

## How We Partner With Allocators

> We build this intelligence into private dashboards for funds, family offices, and growth-stage operators. Each engagement begins with a working session to map your universe, tailor the expert roster, and automate refresh cadences.

- Review the baseline intelligence we have prepared for you.
- Explore the latest intelligence we prepared for you, including sector-level themes and newly surfaced catalysts.
- Dive into our live [Expert Intelligence feed](${intelligenceUrl}) for qualitative signals we monitor each week.
- Identify the tickers, sectors, or private holdings where you would like deeper coverage.
- Decide whether you prefer our weekly managed updates or a co-built workspace your team can extend.

[Schedule a Private Build Session →](${sessionUrl})

---

## What Happens Next

- **Within 24 hours** you will receive a short follow-up outlining how we custom-build these dashboards for funds and portfolio operators.
- **Need a guided walkthrough now?** Reply directly to this email and we will align on timing.

We are honored to earn your trust at this very first touchpoint. If there is anything specific you want us to prepare ahead of a session, simply let us know.

Warm regards,  
**The 3YMode Team**

---

*You are receiving this message because ${safeRecipient} just created a premium account at 3YMode. If this was not you, reply directly so we can investigate immediately.*
`

  return {
    subject,
    markdown,
  }
}
