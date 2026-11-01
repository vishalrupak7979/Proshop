// Allows in-app paths and web links, which rules out javascript: and similar
export const isSafeLink = (link) => /^\/(?!\/)/.test(link) || /^https?:\/\//i.test(link)
