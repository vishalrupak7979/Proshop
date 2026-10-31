import React from 'react'
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser } from 'react-icons/fa'
import { logout } from '../store/slices/userSlice'
import ThemeToggle from './ThemeToggle'

const Header = () => {
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

  return (
    <header className="site-header">
      <Navbar expand="md" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>ProShop</Navbar.Brand>
          </LinkContainer>

          <div className="header-actions">
            <ThemeToggle />
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-md-center">
              <LinkContainer to="/cart">
                <Nav.Link>
                  <FaShoppingCart aria-hidden="true" /> Cart
                  {cartCount > 0 && <Badge bg="primary" pill className="ms-2">{cartCount}</Badge>}
                </Nav.Link>
              </LinkContainer>

              {userInfo?.isAdmin && (
                <LinkContainer to="/admin/orders">
                  <Nav.Link>All orders</Nav.Link>
                </LinkContainer>
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
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
