import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const userInfo = useSelector((state) => state.user.userInfo)
  if (!userInfo) {
    return <Navigate to={`/login?redirect=${window.location.pathname}`} replace />
  }
  return children
}

export default ProtectedRoute
