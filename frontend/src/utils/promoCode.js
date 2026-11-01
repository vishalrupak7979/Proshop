const KEY = 'promoCode'

export const savePromoCode = (code) => {
  try {
    localStorage.setItem(KEY, code)
  } catch (e) {
    // ignore blocked storage, the customer can still type the code
  }
}

export const readPromoCode = () => {
  try {
    return localStorage.getItem(KEY) || ''
  } catch (e) {
    return ''
  }
}

export const clearPromoCode = () => {
  try {
    localStorage.removeItem(KEY)
  } catch (e) {
    // nothing to clear
  }
}
