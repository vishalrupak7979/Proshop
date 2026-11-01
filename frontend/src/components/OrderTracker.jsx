import { FaCheck, FaMapMarkerAlt } from 'react-icons/fa'
import { TRACKING_STEPS } from '../utils/orderStatus'

const MAP_SPAN = 0.01

const mapUrl = ({ lat, lng }) => {
  const box = [lng - MAP_SPAN, lat - MAP_SPAN, lng + MAP_SPAN, lat + MAP_SPAN].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${lat},${lng}`
}

const formatTime = (date) =>
  new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const OrderTracker = ({ order }) => {
  const { status, statusHistory = [], currentLocation: location, deliveryPartner: partner } = order
  const reached = TRACKING_STEPS.indexOf(status)
  const stopped = reached === -1

  return (
    <section className="tracker">
      <h2>Tracking</h2>

      {stopped ? (
        <p className={`tracker-stopped tracker-${status.toLowerCase()}`}>
          {status === 'Failed' ? 'Delivery attempt failed' : 'This order was cancelled'}
        </p>
      ) : (
        <ol className="tracker-steps">
          {TRACKING_STEPS.map((step, index) => (
            <li
              key={step}
              className={index <= reached ? 'is-done' : ''}
              aria-current={index === reached ? 'step' : undefined}
            >
              <span className="tracker-dot">{index <= reached && <FaCheck aria-hidden="true" />}</span>
              {step}
            </li>
          ))}
        </ol>
      )}

      {partner && !stopped && status !== 'Delivered' && (
        <p className="tracker-partner">
          Your delivery partner is <strong>{partner.name}</strong>
          {partner.phone && <> · <a href={`tel:${partner.phone}`}>{partner.phone}</a></>}
        </p>
      )}

      {location && (
        <div className="tracker-location">
          <p>
            <FaMapMarkerAlt aria-hidden="true" /> {location.label || 'Live location'}
            <span>Updated {formatTime(location.updatedAt)}</span>
          </p>
          {location.lat !== undefined && (
            <iframe title="Delivery location map" src={mapUrl(location)} loading="lazy" />
          )}
        </div>
      )}

      {statusHistory.length > 0 && (
        <ul className="tracker-history">
          {[...statusHistory].reverse().map((event) => (
            <li key={`${event.status}-${event.at}`}>
              <strong>{event.status}</strong>
              {event.note && <span>{event.note}</span>}
              <time>{formatTime(event.at)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default OrderTracker
