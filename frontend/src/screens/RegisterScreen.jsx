import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { registerUser, clearUserError } from '../store/slices/userSlice'
import AuthLayout from '../components/AuthLayout'

const RegisterScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { userInfo, loading, error } = useSelector((state) => state.user)
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'

  useEffect(() => {
    dispatch(clearUserError())
  }, [dispatch])

  useEffect(() => {
    if (userInfo) {
      navigate(redirect, { replace: true })
    }
  }, [navigate, userInfo, redirect])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(registerUser({ name, email, password }))
  }

  return (
    <AuthLayout title="Create an account" subtitle="Join ProShop in less than a minute." error={error}>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="name" className="my-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="password" className="my-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2 w-100 auth-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </Form>

      <p className="auth-switch">
        Have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default RegisterScreen
