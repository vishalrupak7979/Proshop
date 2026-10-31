// Only follow in-app paths, so a crafted ?redirect= link can't send users elsewhere
export const safeRedirect = (path) =>
  path && path.startsWith('/') && !path.startsWith('//') ? path : '/'
