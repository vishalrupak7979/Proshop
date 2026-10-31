// Sent over Brevo's HTTPS API because Render's free tier blocks outbound SMTP
const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.BREVO_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`BREVO_API_KEY is not set, email not sent: ${subject}`)
    } else {
      console.log(`[email to ${to}] ${subject}\n${text}`)
    }
    return
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'ProShop', email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    throw new Error(`Brevo responded with ${res.status}: ${await res.text()}`)
  }
}

export default sendEmail
