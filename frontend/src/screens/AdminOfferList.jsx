import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { usePageTitle } from '../utils/usePageTitle'

const EMPTY_OFFER = {
  name: '',
  discountPercent: '',
  startsAt: '',
  endsAt: '',
  appliesTo: 'all',
  categories: [],
  products: [],
  notifyCustomers: true,
}

const offerState = (offer) => {
  const now = Date.now()
  if (!offer.isActive) return { label: 'Paused', bg: 'secondary' }
  if (new Date(offer.startsAt).getTime() > now) return { label: 'Scheduled', bg: 'info', text: 'dark' }
  if (new Date(offer.endsAt).getTime() < now) return { label: 'Ended', bg: 'secondary' }
  return { label: 'Live', bg: 'success' }
}

const selectedValues = (e) => [...e.target.selectedOptions].map((option) => option.value)

const AdminOfferList = () => {
  const [offers, setOffers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_OFFER)
  const [saving, setSaving] = useState(false)

  usePageTitle('Festival offers')

  useEffect(() => {
    Promise.all([axios.get('/offers'), axios.get('/products/admin/all')])
      .then(([offerList, productList]) => {
        setOffers(offerList.data)
        setProducts(productList.data)
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load offers'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const createOffer = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await axios.post('/offers', {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      })
      setOffers((current) => [data, ...current])
      setForm(EMPTY_OFFER)
      toast.success('Offer created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create the offer')
    } finally {
      setSaving(false)
    }
  }

  const toggleOffer = async (offer) => {
    try {
      const { data } = await axios.put(`/offers/${offer._id}`, { ...offer, isActive: !offer.isActive })
      setOffers((current) => current.map((o) => (o._id === data._id ? data : o)))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the offer')
    }
  }

  const deleteOffer = async (offer) => {
    if (!window.confirm(`Delete ${offer.name}? Prices go back to normal straight away.`)) return

    try {
      await axios.delete(`/offers/${offer._id}`)
      setOffers((current) => current.filter((o) => o._id !== offer._id))
      toast.success('Offer deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the offer')
    }
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const categories = [...new Set(products.map((p) => p.category))]

  return (
    <>
      <h1 className="page-title">Festival offers</h1>

      <Row className="g-4">
        <Col lg={8}>
          {offers.length === 0 ? (
            <div className="empty-state">
              <h2>No offers yet</h2>
              <p>Create one for your next festival sale.</p>
            </div>
          ) : (
            <Table responsive hover className="data-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Discount</th>
                  <th>Applies to</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const state = offerState(offer)
                  return (
                    <tr key={offer._id}>
                      <td>
                        {offer.name}
                        <div className="table-muted">
                          {new Date(offer.startsAt).toLocaleDateString('en-IN')} to {new Date(offer.endsAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td>{offer.discountPercent}%</td>
                      <td>
                        {offer.appliesTo === 'all' && 'All products'}
                        {offer.appliesTo === 'category' && offer.categories.join(', ')}
                        {offer.appliesTo === 'products' && `${offer.products.length} products`}
                      </td>
                      <td><Badge bg={state.bg} text={state.text}>{state.label}</Badge></td>
                      <td>
                        <div className="table-actions">
                          <Button size="sm" variant="outline-primary" onClick={() => toggleOffer(offer)}>
                            {offer.isActive ? 'Pause' : 'Resume'}
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteOffer(offer)}>Delete</Button>
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
              <h2>New offer</h2>
              <Form onSubmit={createOffer}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Offer name</Form.Label>
                  <Form.Control required placeholder="e.g. Diwali Sale" value={form.name} onChange={setField('name')} />
                </Form.Group>
                <Form.Group controlId="discountPercent" className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control type="number" min="1" max="90" required value={form.discountPercent} onChange={setField('discountPercent')} />
                </Form.Group>
                <Form.Group controlId="startsAt" className="mb-3">
                  <Form.Label>Starts</Form.Label>
                  <Form.Control type="datetime-local" required value={form.startsAt} onChange={setField('startsAt')} />
                </Form.Group>
                <Form.Group controlId="endsAt" className="mb-3">
                  <Form.Label>Ends</Form.Label>
                  <Form.Control type="datetime-local" required value={form.endsAt} onChange={setField('endsAt')} />
                </Form.Group>
                <Form.Group controlId="appliesTo" className="mb-3">
                  <Form.Label>Applies to</Form.Label>
                  <Form.Select value={form.appliesTo} onChange={setField('appliesTo')}>
                    <option value="all">All products</option>
                    <option value="category">Categories</option>
                    <option value="products">Specific products</option>
                  </Form.Select>
                </Form.Group>
                {form.appliesTo === 'category' && (
                  <Form.Group controlId="categories" className="mb-3">
                    <Form.Label>Categories</Form.Label>
                    <Form.Select multiple required value={form.categories} onChange={(e) => setForm({ ...form, categories: selectedValues(e) })}>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </Form.Select>
                  </Form.Group>
                )}
                {form.appliesTo === 'products' && (
                  <Form.Group controlId="products" className="mb-3">
                    <Form.Label>Products</Form.Label>
                    <Form.Select multiple required value={form.products} onChange={(e) => setForm({ ...form, products: selectedValues(e) })}>
                      {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                )}
                <Form.Check
                  id="notifyCustomers"
                  className="mb-3"
                  label="Notify customers"
                  checked={form.notifyCustomers}
                  onChange={(e) => setForm({ ...form, notifyCustomers: e.target.checked })}
                />
                <Button type="submit" className="w-100" disabled={saving}>
                  {saving ? 'Creating...' : 'Create offer'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AdminOfferList
