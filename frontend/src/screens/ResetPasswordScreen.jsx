import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import AuthSuccessIcon from '../components/AuthSuccessIcon'
import { usePageTitle } from '../utils/usePageTitle'

const ResetPasswordScreen = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  usePageTitle('Reset password')

  const submitHandler = async (e) => {
    e.preventDefault()

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post(`/users/reset-password/${token}`, { password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <AuthSuccessIcon />
        <p className="auth-subtitle">You can now sign in with your new password.</p>
        <Link to="/login" className="btn btn-primary w-100 auth-submit">Sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 6 characters." error={error}>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="password" className="my-3">
          <Form.Label>New password</Form.Label>
          <PasswordInput
            autoComplete="new-password"
            required
            minLength={6}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="confirm" className="my-3">
          <Form.Label>Confirm new password</Form.Label>
          <PasswordInput
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-2 w-100 auth-submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </Form>

      <p className="auth-switch">
        Link not working? <Link to="/forgot-password">Request a new one</Link>
      </p>
    </AuthLayout>
  )
}

export default ResetPasswordScreen
