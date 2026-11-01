import { useEffect, useState } from 'react'
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { formatPrice } from '../utils/formatPrice'
import { returnBadge } from '../utils/supportStatus'
import { usePageTitle } from '../utils/usePageTitle'

const AdminReturnList = () => {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [receiving, setReceiving] = useState(null)
  const [restock, setRestock] = useState(true)

  usePageTitle('Returns')

  useEffect(() => {
    axios.get('/returns')
      .then(({ data }) => setReturns(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load returns'))
      .finally(() => setLoading(false))
  }, [])

  const act = async (ret, action, body, message) => {
    setBusyId(ret._id)
    try {
      const { data } = await axios.put(`/returns/${ret._id}/${action}`, body)
      setReturns((current) => current.map((r) => (r._id === data._id ? { ...data, user: r.user } : r)))
      toast.success(message)
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the return')
      return false
    } finally {
      setBusyId(null)
    }
  }

  const refund = (ret) => {
    if (window.confirm(`Refund ${formatPrice(ret.refundAmount)} for this return?`)) {
      act(ret, 'refund', {}, 'Refund issued')
    }
  }

  const reject = async (e) => {
    e.preventDefault()
    if (await act(rejecting, 'reject', { note: rejectNote }, 'Return declined')) {
      setRejecting(null)
      setRejectNote('')
    }
  }

  const receive = async (e) => {
    e.preventDefault()
    if (await act(receiving, 'receive', { restock }, 'Marked as received')) {
      setReceiving(null)
      setRestock(true)
    }
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  return (
    <>
      <h1 className="page-title">Returns</h1>

      {returns.length === 0 ? (
        <div className="empty-state">
          <h2>No returns yet</h2>
          <p>Customer return requests will appear here.</p>
        </div>
      ) : (
        <Table responsive hover className="data-table">
          <thead>
            <tr>
              <th>Return</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Reason</th>
              <th>Refund</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => (
              <tr key={ret._id}>
                <td><Link to={`/order/${ret.order}`}>#{ret._id.slice(-8).toUpperCase()}</Link></td>
                <td>
                  {ret.user?.name || 'Deleted user'}
                  <div className="table-muted">{ret.user?.email}</div>
                </td>
                <td>
                  {ret.items.map((item) => (
                    <div key={`${item.product}-${item.color}`}>
                      {item.name}{item.color && ` (${item.color})`} × {item.qty}
                    </div>
                  ))}
                </td>
                <td>
                  {ret.reason}
                  {ret.note && <div className="table-muted">{ret.note}</div>}
                </td>
                <td>{formatPrice(ret.refundAmount)}</td>
                <td><Badge {...returnBadge(ret.status)}>{ret.status}</Badge></td>
                <td>
                  <div className="status-stack">
                    {ret.status === 'Requested' && (
                      <Button size="sm" disabled={busyId === ret._id} onClick={() => act(ret, 'approve', {}, 'Return approved')}>
                        Approve
                      </Button>
                    )}
                    {ret.status === 'Approved' && (
                      <Button size="sm" disabled={busyId === ret._id} onClick={() => setReceiving(ret)}>
                        Mark received
                      </Button>
                    )}
                    {ret.status === 'Received' && (
                      <Button size="sm" disabled={busyId === ret._id} onClick={() => refund(ret)}>
                        Refund
                      </Button>
                    )}
                    {['Requested', 'Approved'].includes(ret.status) && (
                      <Button size="sm" variant="outline-danger" disabled={busyId === ret._id} onClick={() => setRejecting(ret)}>
                        Decline
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={Boolean(rejecting)} onHide={() => setRejecting(null)} centered>
        <Form onSubmit={reject}>
          <Modal.Header closeButton><Modal.Title>Decline return</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group controlId="rejectNote">
              <Form.Label>Reason shown to the customer</Form.Label>
              <Form.Control as="textarea" rows={3} required maxLength={500} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={busyId !== null}>Decline return</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(receiving)} onHide={() => setReceiving(null)} centered>
        <Form onSubmit={receive}>
          <Modal.Header closeButton><Modal.Title>Mark as received</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Check
              id="restock"
              label="Items can be sold again, add them back to stock"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={() => setReceiving(null)}>Cancel</Button>
            <Button type="submit" disabled={busyId !== null}>Confirm</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default AdminReturnList
