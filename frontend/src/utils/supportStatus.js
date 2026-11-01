const RETURN_BADGES = {
  Requested: { bg: 'info', text: 'dark' },
  Approved: { bg: 'primary' },
  Rejected: { bg: 'danger' },
  Received: { bg: 'warning', text: 'dark' },
  Refunded: { bg: 'success' },
}

const QUERY_BADGES = {
  Open: { bg: 'warning', text: 'dark' },
  Answered: { bg: 'success' },
  Closed: { bg: 'secondary' },
}

export const returnBadge = (status) => RETURN_BADGES[status] || RETURN_BADGES.Requested
export const queryBadge = (status) => QUERY_BADGES[status] || QUERY_BADGES.Open
