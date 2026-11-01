import crypto from 'crypto'
import User from '../models/userModel.js'
import Order from '../models/orderModel.js'
import generateToken from '../utils/generateToken.js'
import sendEmail from '../utils/sendEmail.js'

const RESET_TOKEN_LIFETIME = 30 * 60 * 1000
const RESET_EMAIL_COOLDOWN = 60 * 1000

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// LOGIN
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = await User.findOne({ email: email.trim() })

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isDeliveryPartner: user.isDeliveryPartner,
      token: generateToken(user._id)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Name and email are required' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const userExists = await User.findOne({ email: email.trim() })

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({
      name: name.trim(), email: email.trim(), password
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isDeliveryPartner: user.isDeliveryPartner,
      token: generateToken(user._id)
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  // Same reply either way, so this can't be used to discover who has an account
  const reply = { message: 'If an account exists for that email, a reset link is on its way' }

  try {
    const { email } = req.body

    if (typeof email !== 'string') {
      return res.json(reply)
    }

    const user = await User.findOne({ email: email.trim() })

    const lastSentAt = user?.resetPasswordExpires?.getTime() - RESET_TOKEN_LIFETIME
    if (!user || Date.now() - lastSentAt < RESET_EMAIL_COOLDOWN) {
      return res.json(reply)
    }

    // Only a hash is stored, so a database leak doesn't expose usable links
    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = hashToken(token)
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_LIFETIME)
    await user.save()

    const resetUrl = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/reset-password/${token}`

    // Not awaited, so response time doesn't reveal whether the account exists
    sendEmail({
      to: user.email,
      subject: 'Reset your ProShop password',
      text: `Reset your ProShop password using this link: ${resetUrl}\n\nIt expires in 30 minutes. If you didn't ask for this, you can ignore this email.`,
      html: `<p>We received a request to reset your ProShop password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in 30 minutes. If you didn't ask for this, you can ignore this email.</p>`,
    }).catch((err) => console.error(`Reset email failed: ${err.message}`))

    res.json(reply)
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong, please try again' })
  }
}

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' })
    }

    user.password = password
    // A token issued in this same second has a rounded-down iat, so leave a margin
    user.passwordChangedAt = new Date(Date.now() - 1000)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong, please try again' })
  }
}

// ADMIN: LIST DELIVERY PARTNERS
export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ isDeliveryPartner: true }).select('name email phone').sort({ name: 1 })

    const stats = await Order.aggregate([
      { $match: { deliveryPartner: { $in: partners.map((p) => p._id) } } },
      {
        $group: {
          _id: '$deliveryPartner',
          active: { $sum: { $cond: [{ $in: ['$status', ['Assigned', 'Picked up', 'Out for delivery']] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          cashCollected: { $sum: { $cond: ['$codCollected', '$totalPrice', 0] } },
        },
      },
    ])

    res.json(partners.map((partner) => {
      const stat = stats.find((s) => s._id.equals(partner._id))
      return {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        active: stat?.active || 0,
        delivered: stat?.delivered || 0,
        cashCollected: stat?.cashCollected || 0,
      }
    }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ADMIN: CREATE DELIVERY PARTNER
export const createDeliveryPartner = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Name and email are required' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    if (typeof phone !== 'string' || !/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({ message: 'Enter a 10 digit mobile number' })
    }

    if (await User.findOne({ email: email.trim() })) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const partner = await User.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      isDeliveryPartner: true,
    })

    res.status(201).json({
      _id: partner._id,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      active: 0,
      delivered: 0,
      cashCollected: 0,
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
