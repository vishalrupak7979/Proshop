// The same product in two colours is two lines in the cart
export const lineKey = (item) => `${item._id}:${item.color || ''}`

export const cartLinePayload = ({ _id, qty, color }) => ({ _id, qty, color })

export const withColor = (product, color = product.colors?.[0]) => ({
  ...product,
  color: color?.name,
  image: color?.image || product.image,
})
