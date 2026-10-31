// Sample orders, linked to seeded users and products by seeder.js
const orders = [
  {
    userEmail: 'john@example.com',
    items: [['Apple MacBook Pro 14-inch', 1], ['Apple AirPods', 1]],
    shippingAddress: { address: '12 MG Road', city: 'Bengaluru', postalCode: '560001', country: 'India' },
    daysAgo: 21,
    isPaid: true,
    isDelivered: true,
  },
  {
    userEmail: 'john@example.com',
    items: [['Realme C35', 2]],
    shippingAddress: { address: '12 MG Road', city: 'Bengaluru', postalCode: '560001', country: 'India' },
    daysAgo: 3,
    isPaid: true,
    isDelivered: false,
  },
  {
    userEmail: 'jane@example.com',
    items: [['Apple iPad mini 2021', 1], ['Apple MagSafe Battery Pack', 1]],
    shippingAddress: { address: '48 Marine Drive', city: 'Mumbai', postalCode: '400020', country: 'India' },
    daysAgo: 12,
    isPaid: true,
    isDelivered: true,
  },
  {
    userEmail: 'jane@example.com',
    items: [['Samsung Galaxy Tab S8+', 1]],
    shippingAddress: { address: '48 Marine Drive', city: 'Mumbai', postalCode: '400020', country: 'India' },
    daysAgo: 1,
    isPaid: false,
    isDelivered: false,
  },
]

export default orders
