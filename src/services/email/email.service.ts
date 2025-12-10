import sgMail from '@sendgrid/mail'

export interface AdminAlertParams {
  subject: string
  body: string
  storyId?: string
  userId?: string
}

export class EmailService {
  private isConfigured: boolean = false

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL

    if (!apiKey || !adminEmail) {
      console.warn('[Email] SendGrid not configured. Email notifications will be skipped.')
      console.warn('[Email] Set SENDGRID_API_KEY and ADMIN_EMAIL to enable email notifications.')
      this.isConfigured = false
      return
    }

    sgMail.setApiKey(apiKey)
    this.isConfigured = true
  }

  /**
   * Sends alert email to admin about story generation failure
   */
  async sendAdminAlert(params: AdminAlertParams): Promise<void> {
    if (!this.isConfigured) {
      console.log('[Email] Skipping email (not configured):', params.subject)
      return
    }

    const adminEmail = process.env.ADMIN_EMAIL!
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@bajki.app'

    try {
      console.log('[Email] Sending admin alert:', params.subject)

      const htmlBody = this.formatHtmlBody(params)

      const msg = {
        to: adminEmail,
        from: fromEmail,
        subject: `🚨 ${params.subject}`,
        text: params.body,
        html: htmlBody,
      }

      await sgMail.send(msg)
      console.log('[Email] Alert sent successfully to:', adminEmail)

    } catch (error: any) {
      console.error('[Email] Failed to send email:', error)
      // Don't throw - email failures shouldn't break story generation flow
    }
  }

  /**
   * Formats error details into HTML for better readability
   */
  private formatHtmlBody(params: AdminAlertParams): string {
    const timestamp = new Date().toISOString()

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #dc2626;
      color: white;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 5px;
      border: 1px solid #e5e7eb;
    }
    .meta {
      color: #6b7280;
      font-size: 14px;
      margin-top: 10px;
    }
    pre {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 12px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>🚨 Story Generation Error Alert</h2>
  </div>

  <div class="content">
    <h3>${params.subject}</h3>

    ${params.storyId ? `<p><strong>Story ID:</strong> ${params.storyId}</p>` : ''}
    ${params.userId ? `<p><strong>User ID:</strong> ${params.userId}</p>` : ''}

    <p class="meta"><strong>Time:</strong> ${timestamp}</p>

    <h4>Error Details:</h4>
    <pre>${this.escapeHtml(params.body)}</pre>
  </div>

  <div class="footer">
    <p>This is an automated alert from Bajki App story generation system.</p>
    <p>Check the application logs for more details.</p>
  </div>
</body>
</html>
    `
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  /**
   * Sends success notification (optional - for monitoring)
   */
  async sendSuccessNotification(storyId: string, duration: number): Promise<void> {
    if (!this.isConfigured) {
      return
    }

    // Only send if explicitly enabled
    const sendSuccessEmails = process.env.SEND_SUCCESS_EMAILS === 'true'
    if (!sendSuccessEmails) {
      return
    }

    try {
      await this.sendAdminAlert({
        subject: `Story Generated Successfully`,
        body: `Story ${storyId} was generated successfully in ${duration}ms`,
        storyId,
      })
    } catch (error) {
      // Silently fail
    }
  }
}
