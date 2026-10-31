const MAX_PER_ORDER = 10

export const maxQty = (stock) => Math.min(stock, MAX_PER_ORDER)

export const qtyOptions = (stock) => [...Array(maxQty(stock)).keys()].map((x) => x + 1)
