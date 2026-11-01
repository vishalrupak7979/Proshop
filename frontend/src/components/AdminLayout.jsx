import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBell,
  FaBoxOpen,
  FaBullhorn,
  FaClipboardList,
  FaStore,
  FaTags,
  FaTruck,
} from 'react-icons/fa'
import { readJSON } from '../utils/storage'

const STORAGE_KEY = 'adminSidebarOpen'
const LARGE_SCREEN = 992

const LINKS = [
  { to: '/admin/orders', label: 'Orders', Icon: FaClipboardList },
  { to: '/admin/products', label: 'Products', Icon: FaBoxOpen },
  { to: '/admin/offers', label: 'Festival offers', Icon: FaTags },
  { to: '/admin/ads', label: 'Advertisements', Icon: FaBullhorn },
  { to: '/admin/delivery-partners', label: 'Delivery partners', Icon: FaTruck },
  { to: '/admin/notifications', label: 'Send notification', Icon: FaBell },
]

const isLargeScreen = () => window.innerWidth >= LARGE_SCREEN

const AdminLayout = () => {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => isLargeScreen() && readJSON(STORAGE_KEY, true))

  // On small screens the open panel covers the page, so close it after choosing
  useEffect(() => {
    if (!isLargeScreen()) setOpen(false)
  }, [pathname])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (isLargeScreen()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        // ignore blocked storage, the choice just won't persist
      }
    }
  }

  return (
    <div className={open ? 'admin-shell is-open' : 'admin-shell'}>
      <aside className="admin-sidebar">
        <button
          type="button"
          className="admin-toggle"
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? 'Collapse admin menu' : 'Expand admin menu'}
          title={open ? 'Collapse menu' : 'Expand menu'}
          onClick={toggle}
        >
          {open ? <FaAngleDoubleLeft aria-hidden="true" /> : <FaAngleDoubleRight aria-hidden="true" />}
          <span>Admin</span>
        </button>

        <nav id="admin-nav" aria-label="Admin">
          {LINKS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className="admin-link" title={open ? undefined : label} aria-label={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="admin-link admin-shop-link" title={open ? undefined : 'Back to shop'} aria-label="Back to shop">
          <FaStore aria-hidden="true" />
          <span>Back to shop</span>
        </Link>
      </aside>

      {open && (
        <button type="button" className="admin-backdrop" aria-label="Close admin menu" onClick={toggle} />
      )}

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
