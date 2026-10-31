import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearUserError } from '../store/slices/userSlice'
import Message from '../components/Message'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo, loading, error } = useSelector((state) => state.user)
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    dispatch(clearUserError())
  }, [dispatch])

  useEffect(() => {
    if (userInfo) {
      navigate(redirect, { replace: true })
    }
  }, [userInfo, redirect, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <div className="auth-card">
      <h1>Sign in</h1>

      {error && <Message variant="danger">{error}</Message>}

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
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2 w-100" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Form>

      <p className="auth-switch">
        New customer? <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>Create an account</Link>
      </p>
    </div>
  )
}

export default LoginScreen
