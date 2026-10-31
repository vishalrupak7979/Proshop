import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// Express 4 doesn't catch errors thrown in async handlers, so respond directly
export const protect = async (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' })
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, user not found' })
  }

  next()
}

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401).json({ message: 'Not authorized as admin' })
  }
}
