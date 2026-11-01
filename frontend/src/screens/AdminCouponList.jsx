import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, InputGroup, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { usePageTitle } from '../utils/usePageTitle'

const EMPTY_COUPON = {
  code: '',
  discountPercent: '',
  maxDiscount: '',
  minOrder: '',
  usageLimit: '',
  startsAt: '',
  endsAt: '',
  notifyCustomers: false,
}

// Leaves out letters and numbers that are easy to mix up
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8

const randomCode = () =>
  [...crypto.getRandomValues(new Uint8Array(CODE_LENGTH))]
    .map((value) => CODE_LETTERS[value % CODE_LETTERS.length])
    .join('')

const couponState = (coupon) => {
  const now = Date.now()
  if (!coupon.isActive) return { label: 'Paused', bg: 'secondary' }
  if (new Date(coupon.startsAt).getTime() > now) return { label: 'Scheduled', bg: 'info', text: 'dark' }
  if (new Date(coupon.endsAt).getTime() < now) return { label: 'Ended', bg: 'secondary' }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: 'Used up', bg: 'secondary' }
  return { label: 'Live', bg: 'success' }
}

const AdminCouponList = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_COUPON)
  const [saving, setSaving] = useState(false)

  usePageTitle('Promo codes')

  useEffect(() => {
    axios.get('/coupons')
      .then(({ data }) => setCoupons(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load promo codes'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const createCoupon = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await axios.post('/coupons', {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      })
      setCoupons((current) => [data, ...current])
      setForm(EMPTY_COUPON)
      toast.success(`Promo code ${data.code} created`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create the promo code')
    } finally {
      setSaving(false)
    }
  }

  const toggleCoupon = async (coupon) => {
    try {
      const { data } = await axios.put(`/coupons/${coupon._id}/toggle`)
      setCoupons((current) => current.map((c) => (c._id === data._id ? { ...c, isActive: data.isActive } : c)))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the promo code')
    }
  }

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete ${coupon.code}? It will stop working straight away.`)) return

    try {
      await axios.delete(`/coupons/${coupon._id}`)
      setCoupons((current) => current.filter((c) => c._id !== coupon._id))
      toast.success('Promo code deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the promo code')
    }
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  return (
    <>
      <h1 className="page-title">Promo codes</h1>

      <Row className="g-4">
        <Col lg={8}>
          {coupons.length === 0 ? (
            <div className="empty-state">
              <h2>No promo codes yet</h2>
              <p>Create one and share it with your customers.</p>
            </div>
          ) : (
            <Table responsive hover className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const state = couponState(coupon)
                  return (
                    <tr key={coupon._id}>
                      <td>
                        <code className="coupon-code">{coupon.code}</code>
                        <div className="table-muted">
                          Until {new Date(coupon.endsAt).toLocaleDateString('en-IN')}
                          {coupon.minOrder > 0 && ` · Min ₹${coupon.minOrder.toLocaleString('en-IN')}`}
                        </div>
                      </td>
                      <td>
                        {coupon.discountPercent}%
                        {coupon.maxDiscount && <div className="table-muted">Up to ₹{coupon.maxDiscount.toLocaleString('en-IN')}</div>}
                      </td>
                      <td>{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                      <td><Badge bg={state.bg} text={state.text}>{state.label}</Badge></td>
                      <td>
                        <div className="table-actions">
                          <Button size="sm" variant="outline-primary" onClick={() => toggleCoupon(coupon)}>
                            {coupon.isActive ? 'Pause' : 'Resume'}
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteCoupon(coupon)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Col>

        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2>New promo code</h2>
              <Form onSubmit={createCoupon}>
                <Form.Group controlId="code" className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <InputGroup>
                    <Form.Control
                      required
                      className="coupon-input"
                      pattern="[A-Za-z0-9\-]{3,20}"
                      title="3 to 20 letters, numbers or dashes"
                      value={form.code}
                      onChange={setField('code')}
                    />
                    <Button variant="outline-primary" onClick={() => setForm({ ...form, code: randomCode() })}>
                      Generate
                    </Button>
                  </InputGroup>
                </Form.Group>
                <Form.Group controlId="discountPercent" className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control type="number" min="1" max="90" required value={form.discountPercent} onChange={setField('discountPercent')} />
                </Form.Group>
                <Row className="g-3 mb-3">
                  <Col xs={6}>
                    <Form.Group controlId="maxDiscount">
                      <Form.Label>Max discount ₹</Form.Label>
                      <Form.Control type="number" min="1" placeholder="No limit" value={form.maxDiscount} onChange={setField('maxDiscount')} />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group controlId="minOrder">
                      <Form.Label>Min order ₹</Form.Label>
                      <Form.Control type="number" min="0" placeholder="None" value={form.minOrder} onChange={setField('minOrder')} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group controlId="usageLimit" className="mb-3">
                  <Form.Label>Total uses allowed</Form.Label>
                  <Form.Control type="number" min="1" placeholder="No limit" value={form.usageLimit} onChange={setField('usageLimit')} />
                  <Form.Text>Each customer can use a code once.</Form.Text>
                </Form.Group>
                <Form.Group controlId="startsAt" className="mb-3">
                  <Form.Label>Starts</Form.Label>
                  <Form.Control type="datetime-local" required value={form.startsAt} onChange={setField('startsAt')} />
                </Form.Group>
                <Form.Group controlId="endsAt" className="mb-3">
                  <Form.Label>Ends</Form.Label>
                  <Form.Control type="datetime-local" required value={form.endsAt} onChange={setField('endsAt')} />
                </Form.Group>
                <Form.Check
                  id="notifyCustomers"
                  className="mb-3"
                  label="Notify customers"
                  checked={form.notifyCustomers}
                  onChange={(e) => setForm({ ...form, notifyCustomers: e.target.checked })}
                />
                <Button type="submit" className="w-100" disabled={saving}>
                  {saving ? 'Creating...' : 'Create promo code'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AdminCouponList
