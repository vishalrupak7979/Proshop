export const formatPrice = (num) => {
  return Number(num).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
}