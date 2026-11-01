import { useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import { usePageTitle } from '../utils/usePageTitle'

const EMPTY_MESSAGE = { audience: 'customers', title: '', message: '', link: '' }

const AdminBroadcast = () => {
  const [form, setForm] = useState(EMPTY_MESSAGE)
  const [sending, setSending] = useState(false)

  usePageTitle('Send notification')

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const send = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await axios.post('/notifications/broadcast', form)
      setForm(EMPTY_MESSAGE)
      toast.success(`Sent to ${data.sent} ${data.sent === 1 ? 'person' : 'people'}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send the notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <h1 className="page-title">Send notification</h1>

      <Card className="checkout-card broadcast-card">
        <Card.Body>
          <Form onSubmit={send}>
            <Form.Group controlId="audience" className="mb-3">
              <Form.Label>Send to</Form.Label>
              <Form.Select value={form.audience} onChange={setField('audience')}>
                <option value="customers">All customers</option>
                <option value="partners">All delivery partners</option>
                <option value="all">Everyone</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="title" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control required maxLength={80} value={form.title} onChange={setField('title')} />
            </Form.Group>
            <Form.Group controlId="message" className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={3} required maxLength={300} value={form.message} onChange={setField('message')} />
            </Form.Group>
            <Form.Group controlId="link" className="mb-3">
              <Form.Label>Link (optional)</Form.Label>
              <Form.Control placeholder="/product/... or https://..." value={form.link} onChange={setField('link')} />
            </Form.Group>
            <Button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send notification'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}

export default AdminBroadcast
