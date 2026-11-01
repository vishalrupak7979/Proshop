import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const Footer = () => {
  return (
    <footer className="site-footer">
      <Container className="site-footer-inner">
        <span className="footer-brand">
          <Logo size={20} />
          &copy; {new Date().getFullYear()} ProShop
        </span>
        <nav aria-label="Footer" className="footer-links">
          <Link to="/">Shop</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/calculator">Price calculator</Link>
        </nav>
        <span>Secure payments by Stripe</span>
      </Container>
    </footer>
  )
}

export default Footer
