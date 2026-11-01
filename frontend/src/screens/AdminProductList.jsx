import { useEffect, useState } from 'react'
import { Button, Col, Form, Image, Modal, Row, Table } from 'react-bootstrap'
import { FaTimes, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import ImagePicker from '../components/ImagePicker'
import Paginator from '../components/Paginator'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { formatPrice } from '../utils/formatPrice'
import { imageUrl } from '../utils/imageUrl'
import { usePageTitle } from '../utils/usePageTitle'

const PAGE_SIZE = 12

const EMPTY_PRODUCT = {
  name: '',
  brand: '',
  category: '',
  description: '',
  image: '',
  images: [],
  specifications: [],
  colors: [],
  price: '',
  countInStock: '',
}

const MAX_GALLERY = 8

const AdminProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  usePageTitle('Products')

  useEffect(() => {
    axios.get('/products/admin/all')
      .then(({ data }) => setProducts(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const setRow = (list, index, field) => (e) =>
    setForm((f) => ({
      ...f,
      [list]: f[list].map((row, i) => (i === index ? { ...row, [field]: e.target.value } : row)),
    }))

  const addRow = (list, row) => setForm((f) => ({ ...f, [list]: [...f[list], row] }))

  const removeRow = (list, index) =>
    setForm((f) => ({ ...f, [list]: f[list].filter((_, i) => i !== index) }))

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
  const term = search.trim().toLowerCase()
  const matches = products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term))
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages)
  const pageItems = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Products</h1>
        <Button onClick={() => setForm(EMPTY_PRODUCT)}>Add product</Button>
      </div>

      <Form.Control
        type="search"
        className="admin-search"
        placeholder="Search products"
        aria-label="Search products"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />

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
          {pageItems.map((product) => (
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

      <Paginator page={currentPage} pages={pages} onChange={setPage} />

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

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={4} required value={form.description} onChange={setField('description')} />
              </Form.Group>

              <div className="form-section">
                <h3>More photos</h3>
                {form.images.length > 0 && (
                  <div className="gallery-edit">
                    {form.images.map((image, index) => (
                      <div key={image} className="gallery-edit-item">
                        <Image src={imageUrl(image)} alt="" />
                        <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => removeRow('images', index)}>
                          <FaTimes aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length < MAX_GALLERY && (
                  <ImagePicker
                    id="gallery-upload"
                    label="Add a photo"
                    value=""
                    onChange={(image) => addRow('images', image)}
                  />
                )}
              </div>

              <div className="form-section">
                <h3>Colours</h3>
                {form.colors.map((color, index) => (
                  <div key={index} className="form-row-line">
                    <Form.Control
                      type="color"
                      className="color-input"
                      aria-label={`Colour ${index + 1} shade`}
                      value={color.hex}
                      onChange={setRow('colors', index, 'hex')}
                    />
                    <Form.Control
                      required
                      placeholder="Name, e.g. Midnight Blue"
                      aria-label={`Colour ${index + 1} name`}
                      value={color.name}
                      onChange={setRow('colors', index, 'name')}
                    />
                    <Form.Select
                      aria-label={`Colour ${index + 1} photo`}
                      value={color.image || ''}
                      onChange={setRow('colors', index, 'image')}
                    >
                      <option value="">No photo</option>
                      {[form.image, ...form.images].filter(Boolean).map((image, photoIndex) => (
                        <option key={image} value={image}>Photo {photoIndex + 1}</option>
                      ))}
                    </Form.Select>
                    <Button variant="light" aria-label={`Remove colour ${index + 1}`} onClick={() => removeRow('colors', index)}>
                      <FaTrash aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline-primary" onClick={() => addRow('colors', { name: '', hex: '#1d4ed8' })}>
                  Add colour
                </Button>
              </div>

              <div className="form-section">
                <h3>Specifications</h3>
                {form.specifications.map((spec, index) => (
                  <div key={index} className="form-row-line">
                    <Form.Control
                      required
                      placeholder="e.g. Display"
                      aria-label={`Specification ${index + 1} name`}
                      value={spec.label}
                      onChange={setRow('specifications', index, 'label')}
                    />
                    <Form.Control
                      required
                      placeholder="e.g. 6.1-inch OLED"
                      aria-label={`Specification ${index + 1} value`}
                      value={spec.value}
                      onChange={setRow('specifications', index, 'value')}
                    />
                    <Button variant="light" aria-label={`Remove specification ${index + 1}`} onClick={() => removeRow('specifications', index)}>
                      <FaTrash aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline-primary" onClick={() => addRow('specifications', { label: '', value: '' })}>
                  Add specification
                </Button>
              </div>
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
