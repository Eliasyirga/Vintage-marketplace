import { Notification, User } from '../models'
import { sendEmail } from './email.service'
import { sendSMS } from './sms.service'

export interface OrderNotificationParams {
  userId: string
  title: string
  message: string
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'MEETING' | 'SYSTEM'
  link?: string
  metadata?: Record<string, unknown>
}

/**
 * Dispatches an in-app notification and attempts email/SMS delivery if appropriate.
 */
export async function sendOrderNotification(params: OrderNotificationParams): Promise<Notification> {
  const notification = await Notification.create({
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link || null,
    metadata: params.metadata || null,
    is_read: false,
  })

  // Async attempt email/SMS delivery without blocking the HTTP request
  ;(async () => {
    try {
      const user = await User.findByPk(params.userId)
      if (!user) return

      if (user.email && user.is_email_verified) {
        await sendEmail({
          to: user.email,
          subject: `${params.title} - Bonda Marketplace`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #d97706; margin-top: 0;">${params.title}</h2>
              <p style="color: #333; font-size: 15px; line-height: 1.6;">${params.message}</p>
              ${
                params.link
                  ? `<div style="margin-top: 24px;">
                      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${params.link}" style="background: #d97706; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View Order Details</a>
                    </div>`
                  : ''
              }
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 12px;">
                Bonda / Vintage Marketplace — Ethiopian Used Products Platform
              </p>
            </div>
          `,
        }).catch(() => {})
      }

      if (user.phone && user.is_phone_verified) {
        await sendSMS(
          user.phone,
          `[Bonda Marketplace] ${params.title}: ${params.message}`,
        ).catch(() => {})
      }
    } catch {
      // Ignored for non-blocking notifications
    }
  })()

  return notification
}
