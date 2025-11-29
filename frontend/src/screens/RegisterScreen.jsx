import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { registerUser } from '../store/slices/userSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'

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
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, userInfo, redirect])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(registerUser({ name, email, password }))
  }

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={6}>
        <h1>Sign Up</h1>
        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="email" className="my-2">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="password" className="my-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>

          <Button type="submit" variant="primary" className="my-3">Register</Button>
        </Form>

        <Row className="py-3">
          <Col>
            Have an Account? <Link to={`/login?redirect=${redirect}`}>Login</Link>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default RegisterScreen
