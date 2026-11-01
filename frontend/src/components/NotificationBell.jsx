import { useEffect } from 'react'
import { Badge, Dropdown } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaBell } from 'react-icons/fa'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../store/slices/notificationSlice'

const REFRESH_MS = 30000

const NotificationBell = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const signedIn = useSelector((state) => Boolean(state.user.userInfo))
  const { items, unread } = useSelector((state) => state.notifications)

  useEffect(() => {
    if (!signedIn) return undefined

    dispatch(fetchNotifications())
    const timer = setInterval(() => {
      if (!document.hidden) dispatch(fetchNotifications())
    }, REFRESH_MS)
    return () => clearInterval(timer)
  }, [dispatch, signedIn])

  if (!signedIn) return null

  const openNotification = (item) => {
    dispatch(markNotificationRead(item._id))

    if (/^https?:/.test(item.link)) {
      window.open(item.link, '_blank', 'noopener')
    } else if (item.link) {
      navigate(item.link)
    }
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="button"
        type="button"
        className="icon-button notification-toggle"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        <FaBell aria-hidden="true" />
        {unread > 0 && <Badge bg="danger" pill className="notification-count">{unread > 9 ? '9+' : unread}</Badge>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-menu">
        <div className="notification-head">
          <strong>Notifications</strong>
          {unread > 0 && (
            <button type="button" className="btn btn-link btn-sm" onClick={() => dispatch(markAllNotificationsRead())}>
              Mark all read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="notification-empty">You&apos;re all caught up.</p>
        ) : (
          items.map((item) => (
            <Dropdown.Item
              as="button"
              type="button"
              key={item._id}
              className={item.read ? 'notification-item' : 'notification-item is-unread'}
              onClick={() => openNotification(item)}
            >
              <strong>{item.title}</strong>
              <span>{item.message}</span>
              <time>{new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default NotificationBell
