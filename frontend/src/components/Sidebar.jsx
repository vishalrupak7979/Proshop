import { Badge } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBalanceScale,
  FaBell,
  FaBoxOpen,
  FaBullhorn,
  FaCalculator,
  FaComments,
  FaUndoAlt,
  FaClipboardList,
  FaShoppingCart,
  FaSignInAlt,
  FaSignOutAlt,
  FaStore,
  FaTags,
  FaTicketAlt,
  FaTruck,
  FaUser,
  FaUserPlus,
} from 'react-icons/fa'
import { logout } from '../store/slices/userSlice'

const SHOP_LINKS = [
  { to: '/', label: 'Shop', Icon: FaStore, end: true },
  { to: '/compare', label: 'Compare', Icon: FaBalanceScale },
  { to: '/calculator', label: 'Price calculator', Icon: FaCalculator },
]

const ADMIN_LINKS = [
  { to: '/admin/orders', label: 'Orders', Icon: FaClipboardList },
  { to: '/admin/returns', label: 'Returns', Icon: FaUndoAlt },
  { to: '/admin/queries', label: 'Customer queries', Icon: FaComments },
  { to: '/admin/products', label: 'Products', Icon: FaBoxOpen },
  { to: '/admin/offers', label: 'Festival offers', Icon: FaTags },
  { to: '/admin/coupons', label: 'Promo codes', Icon: FaTicketAlt },
  { to: '/admin/ads', label: 'Advertisements', Icon: FaBullhorn },
  { to: '/admin/delivery-partners', label: 'Delivery partners', Icon: FaTruck },
  { to: '/admin/notifications', label: 'Send notification', Icon: FaBell },
]

const Sidebar = ({ open, onToggle }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userInfo = useSelector((state) => state.user.userInfo)
  const cartCount = useSelector((state) =>
    state.cart.cartItems.reduce((acc, item) => acc + item.qty, 0)
  )

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const renderLink = ({ to, label, Icon, end, badge }) => (
    <NavLink key={to} to={to} end={end} className="sidebar-link" title={open ? undefined : label} aria-label={label}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      {badge > 0 && <Badge bg="primary" pill className="sidebar-badge">{badge}</Badge>}
    </NavLink>
  )

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? 'Collapse menu' : 'Expand menu'}
        title={open ? 'Collapse menu' : 'Expand menu'}
        onClick={onToggle}
      >
        {open ? <FaAngleDoubleLeft aria-hidden="true" /> : <FaAngleDoubleRight aria-hidden="true" />}
        <span>Menu</span>
      </button>

      <nav id="site-nav" aria-label="Main">
        {SHOP_LINKS.map(renderLink)}
        {renderLink({ to: '/cart', label: 'Cart', Icon: FaShoppingCart, badge: cartCount })}

        <div className="sidebar-section"><span>{userInfo ? userInfo.name : 'Account'}</span></div>

        {userInfo ? (
          <>
            {renderLink({ to: '/profile', label: 'My account', Icon: FaUser })}
            {renderLink({ to: '/returns', label: 'My returns', Icon: FaUndoAlt })}
            {renderLink({ to: '/queries', label: 'My queries', Icon: FaComments })}
            {userInfo.isDeliveryPartner && renderLink({ to: '/delivery', label: 'My deliveries', Icon: FaTruck })}
            <button
              type="button"
              className="sidebar-link"
              title={open ? undefined : 'Logout'}
              aria-label="Logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt aria-hidden="true" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            {renderLink({ to: '/login', label: 'Sign in', Icon: FaSignInAlt })}
            {renderLink({ to: '/register', label: 'Create account', Icon: FaUserPlus })}
          </>
        )}

        {userInfo?.isAdmin && (
          <>
            <div className="sidebar-section"><span>Admin</span></div>
            {ADMIN_LINKS.map(renderLink)}
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
