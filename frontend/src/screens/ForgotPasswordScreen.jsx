import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AuthLayout from '../components/AuthLayout'
import AuthSuccessIcon from '../components/AuthSuccessIcon'

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/users/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <AuthSuccessIcon />
        <p className="auth-subtitle">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your
          password. It expires in 30 minutes, and it may land in your spam folder.
        </p>
        <Link to="/login" className="btn btn-primary w-100 auth-submit">Back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      error={error}
    >
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="my-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2 w-100 auth-submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </Form>

      <p className="auth-switch">
        Remembered it? <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordScreen
