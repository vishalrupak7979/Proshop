import { useEffect, useState } from 'react'
import { Button, Col, Form, Image, Modal, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import ImagePicker from '../components/ImagePicker'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { formatPrice } from '../utils/formatPrice'
import { imageUrl } from '../utils/imageUrl'
import { usePageTitle } from '../utils/usePageTitle'

const EMPTY_PRODUCT = { name: '', brand: '', category: '', description: '', image: '', price: '', countInStock: '' }

const AdminProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  usePageTitle('Products')

  useEffect(() => {
    axios.get('/products/admin/all')
      .then(({ data }) => setProducts(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const saveProduct = async (e) => {
    e.preventDefault()
    if (!form.image) {
      toast.error('Add a product image')
      return
    }

    setSaving(true)
    try {
      if (form._id) {
        const { data } = await axios.put(`/products/${form._id}`, form)
        setProducts((current) => current.map((p) => (p._id === data._id ? data : p)))
        toast.success('Product updated')
      } else {
        const { data } = await axios.post('/products', form)
        setProducts((current) => [data, ...current])
        toast.success('Product added')
      }
      setForm(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the product')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}? Customers will no longer be able to buy it.`)) return

    try {
      await axios.delete(`/products/${product._id}`)
      setProducts((current) => current.filter((p) => p._id !== product._id))
      toast.success('Product deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the product')
    }
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const categories = [...new Set(products.map((p) => p.category))]

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Products</h1>
        <Button onClick={() => setForm(EMPTY_PRODUCT)}>Add product</Button>
      </div>

      <Table responsive hover className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>In stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="table-product">
                  <Image src={imageUrl(product.image)} alt="" />
                  <span>
                    {product.name}
                    <div className="table-muted">{product.brand}</div>
                  </span>
                </div>
              </td>
              <td>{product.category}</td>
              <td>{formatPrice(product.price)}</td>
              <td>{product.countInStock}</td>
              <td>
                <div className="table-actions">
                  <Button size="sm" variant="outline-primary" onClick={() => setForm(product)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deleteProduct(product)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={Boolean(form)} onHide={() => setForm(null)} centered scrollable>
        {form && (
          <Form onSubmit={saveProduct} className="modal-form">
            <Modal.Header closeButton>
              <Modal.Title>{form._id ? 'Edit product' : 'Add product'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ImagePicker label="Product image" value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} />

              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control required value={form.name} onChange={setField('name')} />
              </Form.Group>

              <Row className="g-3 mb-3">
                <Col xs={6}>
                  <Form.Group controlId="brand">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control required value={form.brand} onChange={setField('brand')} />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group controlId="category">
                    <Form.Label>Category</Form.Label>
                    <Form.Control required list="category-options" value={form.category} onChange={setField('category')} />
                    <datalist id="category-options">
                      {categories.map((category) => <option key={category} value={category} />)}
                    </datalist>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group controlId="price">
                    <Form.Label>Price (₹)</Form.Label>
                    <Form.Control type="number" min="1" step="0.01" required value={form.price} onChange={setField('price')} />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group controlId="countInStock">
                    <Form.Label>Quantity available</Form.Label>
                    <Form.Control type="number" min="0" step="1" required value={form.countInStock} onChange={setField('countInStock')} />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={4} required value={form.description} onChange={setField('description')} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="link" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save product'}</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </>
  )
}

export default AdminProductList
