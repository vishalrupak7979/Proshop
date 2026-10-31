// Saved data can be missing, corrupted or blocked, and that shouldn't break the app
export const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch (e) {
    return fallback
  }
}
