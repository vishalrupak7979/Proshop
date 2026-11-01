import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, adminOnly = false, partnerOnly = false }) => {
  const { userInfo, signedOut } = useSelector((state) => state.user)
  const { pathname, search } = useLocation()

  if (!userInfo && signedOut) {
    return <Navigate to="/" replace />
  }
  if (!userInfo) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname + search)}`} replace />
  }
  if ((adminOnly && !userInfo.isAdmin) || (partnerOnly && !userInfo.isDeliveryPartner)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default ProtectedRoute
