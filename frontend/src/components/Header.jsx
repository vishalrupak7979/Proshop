import { useEffect, useState } from 'react'
import { Navbar, Nav, Container, NavDropdown, Badge, Offcanvas } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser } from 'react-icons/fa'
import { logout } from '../store/slices/userSlice'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

const ADMIN_LINKS = [
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/offers', label: 'Festival offers' },
  { to: '/admin/ads', label: 'Advertisements' },
  { to: '/admin/delivery-partners', label: 'Delivery partners' },
  { to: '/admin/notifications', label: 'Send notification' },
]

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const userInfo = useSelector((state) => state.user.userInfo)
  const cartCount = useSelector((state) =>
    state.cart.cartItems.reduce((acc, item) => acc + item.qty, 0)
  )

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    setMenuOpen(false)
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="site-header">
      <Navbar expand="lg" expanded={menuOpen} onToggle={setMenuOpen}>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>ProShop</Navbar.Brand>
          </LinkContainer>

          <div className="header-actions">
            <Link to="/cart" className="icon-button header-cart d-lg-none" aria-label={`Cart, ${cartCount} items`}>
              <FaShoppingCart aria-hidden="true" />
              {cartCount > 0 && <Badge bg="primary" pill className="notification-count">{cartCount}</Badge>}
            </Link>
            <NotificationBell />
            <ThemeToggle />
            <Navbar.Toggle aria-controls="site-menu" />
          </div>

          <Navbar.Offcanvas id="site-menu" placement="end" aria-labelledby="site-menu-title">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="site-menu-title">Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="ms-auto align-items-lg-center">
                <LinkContainer to="/">
                  <Nav.Link>Shop</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/cart">
                  <Nav.Link>
                    <FaShoppingCart aria-hidden="true" /> Cart
                    {cartCount > 0 && <Badge bg="primary" pill className="ms-2">{cartCount}</Badge>}
                  </Nav.Link>
                </LinkContainer>

                {userInfo?.isDeliveryPartner && (
                  <LinkContainer to="/delivery">
                    <Nav.Link>My deliveries</Nav.Link>
                  </LinkContainer>
                )}

                {userInfo?.isAdmin && (
                  <NavDropdown title="Admin" id="admin-menu" align="end">
                    {ADMIN_LINKS.map(({ to, label }) => (
                      <LinkContainer key={to} to={to}>
                        <NavDropdown.Item>{label}</NavDropdown.Item>
                      </LinkContainer>
                    ))}
                  </NavDropdown>
                )}

                {userInfo ? (
                  <NavDropdown title={userInfo.name} id="username" align="end">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>My account</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <LinkContainer to="/login">
                    <Nav.Link><FaUser aria-hidden="true" /> Sign In</Nav.Link>
                  </LinkContainer>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
