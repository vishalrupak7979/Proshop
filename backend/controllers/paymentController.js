import priceCart from '../utils/priceCart.js'
import stripe from '../utils/stripe.js'
import { checkCoupon } from '../utils/coupons.js'

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, error } = await priceCart(req.body.cartItems)

    if (error) {
      return res.status(400).json({ message: error })
    }

    let discounts
    let metadata = {}

    if (req.body.couponCode) {
      const subtotal = items.reduce((acc, { unitPrice, qty }) => acc + unitPrice * qty, 0)
      const { coupon, discount, error: couponError } = await checkCoupon(req.body.couponCode, req.user._id, subtotal)

      if (couponError) {
        return res.status(400).json({ message: couponError })
      }

      // A one-use Stripe coupon, so Stripe charges exactly this discount
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: 'inr',
        duration: 'once',
        max_redemptions: 1,
        name: coupon.code,
      })

      discounts = [{ coupon: stripeCoupon.id }]
      metadata = { couponCode: coupon.code }
    }

    const line_items = items.map(({ product, qty, unitPrice, color, image }) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: color ? `${product.name} (${color})` : product.name,
          metadata: { productId: product._id.toString(), image, name: product.name, color: color || '' },
        },
        unit_amount: Math.round(unitPrice * 100), // amount in paise
      },
      quantity: qty,
    }))

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      discounts,
      metadata,
      mode: 'payment',
      client_reference_id: req.user._id.toString(),
      customer_email: req.user.email,
      shipping_address_collection: { allowed_countries: ['IN'] },
      phone_number_collection: { enabled: true },
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error(`Checkout failed: ${err.message}`)
    res.status(500).json({ message: 'Could not start checkout, please try again' })
  }
}
