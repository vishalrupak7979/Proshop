export const TRACKING_STEPS = ['Placed', 'Assigned', 'Picked up', 'Out for delivery', 'Delivered']

const BADGES = {
  Placed: { bg: 'secondary' },
  Assigned: { bg: 'info', text: 'dark' },
  'Picked up': { bg: 'info', text: 'dark' },
  'Out for delivery': { bg: 'warning', text: 'dark' },
  Delivered: { bg: 'success' },
  Failed: { bg: 'danger' },
  Cancelled: { bg: 'dark' },
}

export const statusBadge = (status) => BADGES[status] || BADGES.Placed

export const isOrderActive = (status) => !['Delivered', 'Failed', 'Cancelled'].includes(status)

export const paymentLabel = (order) => {
  if (order.paymentMethod === 'COD') {
    return order.isPaid ? 'Cash collected' : 'Cash on delivery'
  }
  return order.isPaid ? `Paid by ${order.paymentMethod}` : 'Unpaid'
}
