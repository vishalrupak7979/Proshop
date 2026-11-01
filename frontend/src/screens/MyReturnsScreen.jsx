import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import ReturnCard from '../components/ReturnCard'
import { usePageTitle } from '../utils/usePageTitle'

const MyReturnsScreen = () => {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageTitle('My returns')

  useEffect(() => {
    api.get('/returns/mine')
      .then(({ data }) => setReturns(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your returns'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  return (
    <>
      <h1 className="page-title">My returns</h1>
      {returns.length === 0 ? (
        <div className="empty-state">
          <h2>No returns yet</h2>
          <p>To return something, open a delivered order from <Link to="/profile">My account</Link>.</p>
        </div>
      ) : (
        <div className="delivery-grid">
          {returns.map((ret) => <ReturnCard key={ret._id} ret={ret} showOrder />)}
        </div>
      )}
    </>
  )
}

export default MyReturnsScreen
