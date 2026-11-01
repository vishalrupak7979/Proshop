import { useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import CompareBar from './components/CompareBar'
import ErrorBoundary from './components/ErrorBoundary'
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
import AdminPartnerList from './screens/AdminPartnerList'
import AdminProductList from './screens/AdminProductList'
import AdminOfferList from './screens/AdminOfferList'
import AdminAdList from './screens/AdminAdList'
import AdminBroadcast from './screens/AdminBroadcast'
import CheckoutScreen from './screens/CheckoutScreen'
import CompareScreen from './screens/CompareScreen'
import CalculatorScreen from './screens/CalculatorScreen'
import DeliveryDashboard from './screens/DeliveryDashboard'

const NotFound = () => (
  <div className="empty-state">
    <h1>Page not found</h1>
    <p>The page you are looking for doesn&apos;t exist.</p>
    <Link to="/" className="btn btn-primary">Back to shop</Link>
  </div>
)

// Everything except the admin area sits in the centred page width
const StoreLayout = () => (
  <Container>
    <Outlet />
    <CompareBar />
  </Container>
)

function App() {
  const { pathname } = useLocation()
  const theme = useSelector((state) => state.theme.mode)
  const isAdminArea = pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }, [theme])

  return (
    <div className="app-container">
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />

      <main id="main" className={isAdminArea ? 'main-content is-admin' : 'main-content'}>
        <ErrorBoundary>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:id" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/compare" element={<CompareScreen />} />
              <Route path="/calculator" element={<CalculatorScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
              <Route path="/success" element={<ProtectedRoute><PaymentSuccessScreen /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute><OrderScreen /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutScreen /></ProtectedRoute>} />
              <Route path="/delivery" element={<ProtectedRoute partnerOnly><DeliveryDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<AdminOrderList />} />
              <Route path="products" element={<AdminProductList />} />
              <Route path="offers" element={<AdminOfferList />} />
              <Route path="ads" element={<AdminAdList />} />
              <Route path="delivery-partners" element={<AdminPartnerList />} />
              <Route path="notifications" element={<AdminBroadcast />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar theme={theme} />
    </div>
  )
}

export default App
