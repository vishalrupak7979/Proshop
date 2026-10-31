import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// Counted per account rather than per IP. Behind Render's proxies many customers
// can appear as one IP, and guessing is aimed at a single account anyway
const accountKey = (req) => {
  const { email } = req.body || {}
  if (typeof email === 'string') return email.trim().toLowerCase()
  return req.params.token || ipKeyGenerator(req.ip)
}

// Slows down password guessing and reset email abuse
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: accountKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in a few minutes' },
})
