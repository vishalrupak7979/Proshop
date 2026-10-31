import { Container } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer className="site-footer">
      <Container className="site-footer-inner">
        <span>&copy; {new Date().getFullYear()} ProShop</span>
        <span>Secure payments by Stripe</span>
      </Container>
    </footer>
  )
}

export default Footer
