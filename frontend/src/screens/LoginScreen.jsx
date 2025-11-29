// import React, { useState, useEffect } from 'react'
// import { Form, Button, Row, Col } from 'react-bootstrap'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate, useLocation, Link } from 'react-router-dom'
// import { loginUser } from '../store/slices/userSlice'
// import Loader from '../components/Loader'
// import Message from '../components/Message'

// const LoginScreen = () => {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const { userInfo, loading, error } = useSelector((state) => state.user)
//   const redirect = new URLSearchParams(location.search).get('redirect') || '/'

//   useEffect(() => {
//     if (userInfo) {
//       navigate(redirect)
//     }
//   }, [navigate, userInfo, redirect])

//   const submitHandler = (e) => {
//     e.preventDefault()
//     dispatch(loginUser({ email, password }))
//   }

//   return (
//     <Row className="justify-content-md-center">
//       <Col xs={12} md={6}>
//         <h1>Sign In</h1>
//         {error && <Message variant="danger">{error}</Message>}
//         {loading && <Loader />}
//         <Form onSubmit={submitHandler}>
//           <Form.Group controlId="email" className="my-2">
//             <Form.Label>Email Address</Form.Label>
//             <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
//           </Form.Group>

//           <Form.Group controlId="password" className="my-2">
//             <Form.Label>Password</Form.Label>
//             <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
//           </Form.Group>

//           <Button type="submit" variant="primary" className="my-3">Sign In</Button>
//         </Form>

//         <Row className="py-3">
//           <Col>
//             New Customer? <Link to={`/register?redirect=${redirect}`}>Register</Link>
//           </Col>
//         </Row>
//       </Col>
//     </Row>
//   )
// }

// export default LoginScreen


import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../store/slices/userSlice'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { useNavigate, useSearchParams } from 'react-router-dom'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo, loading, error } = useSelector((state) => state.user)
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [userInfo, redirect, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }
  

  return (
    <div className="login-container">
      <h1>Sign In</h1>

      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}

      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3 w-100">
          Sign In
        </Button>
      </Form>
    </div>
  )
}

export default LoginScreen
