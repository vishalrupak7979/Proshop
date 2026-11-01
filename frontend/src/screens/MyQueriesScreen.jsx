import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { queryBadge } from '../utils/supportStatus'
import { usePageTitle } from '../utils/usePageTitle'

const MyQueriesScreen = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [queries, setQueries] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    topic: params.get('topic') || '',
    subject: params.get('subject') || '',
    message: '',
  })

  usePageTitle('My queries')

  useEffect(() => {
    Promise.all([api.get('/queries/mine'), api.get('/queries/topics')])
      .then(([list, topicList]) => {
        setQueries(list.data)
        setTopics(topicList.data)
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your queries'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/queries', {
        ...form,
        orderId: params.get('order') || undefined,
        productId: params.get('product') || undefined,
      })
      toast.success('Query sent')
      navigate(`/queries/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send your query')
      setSaving(false)
    }
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  return (
    <>
      <h1 className="page-title">My queries</h1>

      <Row className="g-4">
        <Col lg={7}>
          {queries.length === 0 ? (
            <div className="empty-state">
              <h2>No queries yet</h2>
              <p>Ask us anything about an order, a product or a payment.</p>
            </div>
          ) : (
            queries.map((query) => (
              <Link key={query._id} to={`/queries/${query._id}`} className="query-row">
                <span>
                  <strong>{query.subject}</strong>
                  <span className="table-muted">
                    {query.topic} · {new Date(query.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                </span>
                <Badge {...queryBadge(query.status)}>{query.status}</Badge>
              </Link>
            ))
          )}
        </Col>

        <Col lg={5}>
          <Card className="summary-card">
            <Card.Body>
              <h2>Ask a question</h2>
              <Form onSubmit={submit}>
                <Form.Group controlId="topic" className="mb-3">
                  <Form.Label>Topic</Form.Label>
                  <Form.Select required value={form.topic} onChange={setField('topic')}>
                    <option value="">Choose a topic</option>
                    {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="subject" className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control required maxLength={120} value={form.subject} onChange={setField('subject')} />
                </Form.Group>
                <Form.Group controlId="message" className="mb-3">
                  <Form.Label>Your question</Form.Label>
                  <Form.Control as="textarea" rows={4} required maxLength={2000} value={form.message} onChange={setField('message')} />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={saving}>{saving ? 'Sending...' : 'Send query'}</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default MyQueriesScreen
