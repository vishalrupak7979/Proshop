import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// Counted per account rather than per IP. Behind Render's proxies many customers
// can appear as one IP, and guessing is aimed at a single account anyway
const accountKey = (req) => {
  const { email } = req.body || {}
  if (typeof email === 'string') return email.trim().toLowerCase()
  return req.params.token || ipKeyGenerator(req.ip)
}

// Stops promo codes being guessed. Runs after sign-in, so this is per customer
export const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in a few minutes' },
})

// Keeps one account from flooding the support inbox
export const queryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages, please try again later' },
})

// Slows down password guessing and reset email abuse
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: accountKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in a few minutes' },
})
