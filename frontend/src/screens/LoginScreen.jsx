import { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearUserError } from '../store/slices/userSlice'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import { safeRedirect } from '../utils/safeRedirect'
import { usePageTitle } from '../utils/usePageTitle'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo, loading, error } = useSelector((state) => state.user)
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  usePageTitle('Sign in')

  useEffect(() => {
    dispatch(clearUserError())
  }, [dispatch])

  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.isDeliveryPartner && redirect === '/' ? '/delivery' : redirect, { replace: true })
    }
  }, [userInfo, redirect, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your ProShop account." error={error}>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="password" className="my-3">
          <div className="auth-label-row">
            <Form.Label>Password</Form.Label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <PasswordInput
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2 w-100 auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Form>

      <p className="auth-switch">
        New customer? <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}

export default LoginScreen
