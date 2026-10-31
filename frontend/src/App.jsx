import React, { useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomeScreen from './screens/HomeScreen'
import ProductScreen from './screens/ProductScreen'
import CartScreen from './screens/CartScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ProfileScreen from './screens/ProfileScreen'
import OrderScreen from './screens/OrderScreen'
import PaymentSuccessScreen from './screens/PaymentSuccessScreen'
import AdminOrderList from './screens/AdminOrderList'

const NotFound = () => (
  <div className="empty-state">
    <h1>Page not found</h1>
    <p>The page you are looking for doesn&apos;t exist.</p>
    <Link to="/" className="btn btn-primary">Back to shop</Link>
  </div>
)

function App() {
  const { pathname } = useLocation()
  const theme = useSelector((state) => state.theme.mode)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }, [theme])

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/success" element={<ProtectedRoute><PaymentSuccessScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderScreen /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrderList /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar theme={theme} />
    </div>
  )
}

export default App
