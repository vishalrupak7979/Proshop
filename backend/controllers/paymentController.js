import priceCart from '../utils/priceCart.js'
import stripe from '../utils/stripe.js'

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, error } = await priceCart(req.body.cartItems)

    if (error) {
      return res.status(400).json({ message: error })
    }

    const line_items = items.map(({ product, qty, unitPrice }) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: product.name,
          metadata: { productId: product._id.toString(), image: product.image },
        },
        unit_amount: Math.round(unitPrice * 100), // amount in paise
      },
      quantity: qty,
    }))

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
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
