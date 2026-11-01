import { Navbar, Container, Badge } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaBars, FaShoppingCart } from 'react-icons/fa'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

const Header = ({ menuOpen, onToggleMenu }) => {
  const cartCount = useSelector((state) =>
    state.cart.cartItems.reduce((acc, item) => acc + item.qty, 0)
  )

  return (
    <header className="site-header">
      <Navbar>
        <Container fluid>
          <button
            type="button"
            className="icon-button menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={onToggleMenu}
          >
            <FaBars aria-hidden="true" />
          </button>

          <LinkContainer to="/">
            <Navbar.Brand className="brand">
              <Logo size={30} />
              <span>ProShop</span>
            </Navbar.Brand>
          </LinkContainer>

          <div className="header-actions">
            <Link to="/cart" className="icon-button header-cart" aria-label={`Cart, ${cartCount} items`}>
              <FaShoppingCart aria-hidden="true" />
              {cartCount > 0 && <Badge bg="primary" pill className="notification-count">{cartCount}</Badge>}
            </Link>
            <NotificationBell />
            <ThemeToggle />
          </div>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
