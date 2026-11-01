import 'dotenv/config'
import bcrypt from 'bcryptjs'

// The repo is public, so demo passwords live in .env rather than in this file
if (!process.env.SEED_PASSWORD) {
  throw new Error('Set SEED_PASSWORD in .env before running the seeder')
}

const password = bcrypt.hashSync(process.env.SEED_PASSWORD, 10)

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password,
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password,
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password,
  },
  {
    name: 'Ravi Kumar',
    email: 'partner@example.com',
    phone: '9876543210',
    password,
    isDeliveryPartner: true,
  },
]

export default users
