import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { queryBadge } from '../utils/supportStatus'
import { usePageTitle } from '../utils/usePageTitle'

const REFRESH_MS = 20000

const QueryScreen = () => {
  const { id } = useParams()
  const isAdmin = useSelector((state) => state.user.userInfo?.isAdmin)
  const [query, setQuery] = useState(null)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  usePageTitle(query?.subject || 'Query')

  const load = useCallback(() => {
    api.get(`/queries/${id}`)
      .then(({ data }) => setQuery(data))
      .catch((err) => setError(err.response?.data?.message || 'Query not found'))
  }, [id])

  // Replies show up without the customer reloading the page
  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (!document.hidden) load()
    }, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  const send = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.post(`/queries/${id}/messages`, { text })
      setText('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send your message')
    } finally {
      setSending(false)
    }
  }

  const close = async () => {
    try {
      await api.put(`/queries/${id}/close`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not close the query')
    }
  }

  if (error) return <Message variant="danger">{error}</Message>
  if (!query) return <Loader />

  const closed = query.status === 'Closed'

  return (
    <div className="query-page">
      <Link to={isAdmin ? '/admin/queries' : '/queries'} className="back-link">
        <FaArrowLeft aria-hidden="true" /> Back to queries
      </Link>

      <div className="page-head">
        <h1 className="page-title">{query.subject}</h1>
        <Badge {...queryBadge(query.status)}>{query.status}</Badge>
      </div>

      <p className="page-subtitle">
        {query.topic}
        {isAdmin && ` · ${query.user?.name || 'Deleted user'} (${query.user?.email || 'no email'})`}
        {query.order && <> · <Link to={`/order/${query.order}`}>View order</Link></>}
        {query.product && <> · <Link to={`/product/${query.product._id}`}>{query.product.name}</Link></>}
      </p>

      <div className="query-thread">
        {query.messages.map((message) => (
          <div key={message.at} className={message.fromAdmin ? 'query-message from-admin' : 'query-message'}>
            <div className="query-meta">
              <strong>{message.name}</strong>
              <time>{new Date(message.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>
            </div>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      {closed ? (
        <p className="table-muted">This query is closed.</p>
      ) : (
        <Form onSubmit={send}>
          <Form.Group controlId="reply" className="mb-2">
            <Form.Label>Your reply</Form.Label>
            <Form.Control as="textarea" rows={3} required maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
          </Form.Group>
          <div className="delivery-actions">
            <Button type="submit" disabled={sending || !text.trim()}>{sending ? 'Sending...' : 'Send reply'}</Button>
            <Button variant="outline-secondary" onClick={close}>Close query</Button>
          </div>
        </Form>
      )}
    </div>
  )
}

export default QueryScreen
