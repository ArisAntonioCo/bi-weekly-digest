import { NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailDeliveryService } from '@/services/email-delivery.service'
import { buildPremiumWelcomeEmail } from '@/services/email-templates/premium-welcome-email'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const payloadSchema = z.object({
  email: z.string().email().max(320),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = payloadSchema.parse(body)

    logger.info('Sending premium welcome email', { email })

    const { subject, markdown } = buildPremiumWelcomeEmail({
      recipientEmail: email,
    })

    await EmailDeliveryService.sendEmail(
      {
        to: email,
        subject,
      },
      markdown
    )

    logger.info('Premium welcome email sent', { email })

    return NextResponse.json({ sent: true })
  } catch (error) {
    logger.error('Premium welcome email API failed', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send premium welcome email' },
      { status: 500 }
    )
  }
}
