import { Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'
import { returnBadge } from '../utils/supportStatus'

const NEXT_STEP = {
  Requested: 'We are reviewing your request.',
  Approved: 'Approved. Please keep the items ready to hand back.',
  Received: 'We have your items and your refund is next.',
}

const ReturnCard = ({ ret, showOrder = false }) => {
  const declined = ret.history.find((event) => event.status === 'Rejected')

  return (
    <div className="return-card">
      <div className="delivery-head">
        <strong>Return #{ret._id.slice(-8).toUpperCase()}</strong>
        <Badge {...returnBadge(ret.status)}>{ret.status}</Badge>
      </div>

      <ul className="delivery-items">
        {ret.items.map((item) => (
          <li key={`${item.product}-${item.color}`}>
            {item.name}{item.color && ` (${item.color})`} × {item.qty}
          </li>
        ))}
      </ul>

      <div className="table-muted">Reason: {ret.reason}</div>
      {ret.note && <div className="table-muted">{ret.note}</div>}
      {NEXT_STEP[ret.status] && <p className="return-step">{NEXT_STEP[ret.status]}</p>}
      {declined?.note && <p className="return-step">Declined: {declined.note}</p>}

      <div className="summary-row">
        <span>{ret.status === 'Refunded' ? `Refunded (${ret.refundMethod})` : 'Refund amount'}</span>
        <strong>{formatPrice(ret.refundAmount)}</strong>
      </div>

      {showOrder && <Link to={`/order/${ret.order}`}>View order</Link>}
    </div>
  )
}

export default ReturnCard
