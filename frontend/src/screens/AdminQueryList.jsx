import { useEffect, useState } from 'react'
import { Badge, Button, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { queryBadge } from '../utils/supportStatus'
import { usePageTitle } from '../utils/usePageTitle'

const FILTERS = ['All', 'Open', 'Answered', 'Closed']

const AdminQueryList = () => {
  const [queries, setQueries] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageTitle('Customer queries')

  useEffect(() => {
    axios.get('/queries')
      .then(({ data }) => setQueries(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load queries'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const shown = queries.filter((query) => filter === 'All' || query.status === filter)

  return (
    <>
      <h1 className="page-title">Customer queries</h1>

      <div className="category-pills">
        {FILTERS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={name === filter ? 'primary' : 'outline-secondary'}
            aria-pressed={name === filter}
            onClick={() => setFilter(name)}
          >
            {name} ({name === 'All' ? queries.length : queries.filter((q) => q.status === name).length})
          </Button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing here</h2>
          <p>Customer questions will appear here.</p>
        </div>
      ) : (
        <Table responsive hover className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Customer</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((query) => (
              <tr key={query._id}>
                <td><Link to={`/queries/${query._id}`}>{query.subject}</Link></td>
                <td>
                  {query.user?.name || 'Deleted user'}
                  <div className="table-muted">{query.user?.email}</div>
                </td>
                <td>{query.topic}</td>
                <td><Badge {...queryBadge(query.status)}>{query.status}</Badge></td>
                <td>{new Date(query.updatedAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default AdminQueryList
