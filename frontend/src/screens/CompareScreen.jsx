import { useEffect, useState } from 'react'
import { Badge, Button, Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import PriceTag from '../components/PriceTag'
import ProductPicker from '../components/ProductPicker'
import Rating from '../components/Rating'
import { addToCart } from '../store/slices/cartSlice'
import { addToCompare, clearCompare, MAX_COMPARE, removeFromCompare } from '../store/slices/compareSlice'
import { imageUrl } from '../utils/imageUrl'
import { usePageTitle } from '../utils/usePageTitle'

const CompareScreen = () => {
  const dispatch = useDispatch()
  const ids = useSelector((state) => state.compare.ids)
  const cartItems = useSelector((state) => state.cart.cartItems)
  const [catalogue, setCatalogue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageTitle('Compare products')

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => setCatalogue(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  // Keeps the list clean if a compared product has since been deleted
  useEffect(() => {
    if (loading || error) return
    ids.filter((id) => !catalogue.some((p) => p._id === id))
      .forEach((id) => dispatch(removeFromCompare(id)))
  }, [catalogue, dispatch, error, ids, loading])

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const products = ids.map((id) => catalogue.find((p) => p._id === id)).filter(Boolean)
  const lowestPrice = Math.min(...products.map((p) => p.price))
  const topRating = Math.max(...products.map((p) => p.rating))
  const canHighlight = products.length > 1
  const pricesDiffer = new Set(products.map((p) => p.price)).size > 1
  const ratingsDiffer = new Set(products.map((p) => p.rating)).size > 1

  const addProduct = (product) => {
    if (cartItems.some((item) => item._id === product._id)) {
      toast.info(`${product.name} is already in your cart`, { toastId: product._id })
      return
    }
    dispatch(addToCart({ ...product, qty: 1 }))
    toast.success(`${product.name} added to cart`, { toastId: product._id })
  }

  const rows = [
    {
      label: 'Price',
      render: (p) => (
        <>
          <PriceTag product={p} />
          {canHighlight && pricesDiffer && p.price === lowestPrice && <Badge bg="success">Lowest price</Badge>}
        </>
      ),
    },
    {
      label: 'Rating',
      render: (p) => (
        <>
          <Rating value={p.rating} text={`${p.rating} (${p.numReviews})`} />
          {canHighlight && ratingsDiffer && p.rating === topRating && <Badge bg="success" className="mt-1">Top rated</Badge>}
        </>
      ),
    },
    { label: 'Brand', render: (p) => p.brand },
    { label: 'Category', render: (p) => p.category },
    {
      label: 'Availability',
      render: (p) => (p.countInStock > 0 ? `${p.countInStock} in stock` : 'Out of stock'),
    },
    { label: 'Offer', render: (p) => p.offerName || 'None' },
    { label: 'Description', render: (p) => p.description },
  ]

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Compare products</h1>
        {products.length > 0 && (
          <Button variant="link" onClick={() => dispatch(clearCompare())}>Clear all</Button>
        )}
      </div>

      {products.length < MAX_COMPARE && (
        <div className="tool-picker">
          <ProductPicker
            products={catalogue}
            exclude={ids}
            placeholder="Search for a product to compare"
            onPick={(product) => dispatch(addToCompare(product._id))}
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing to compare yet</h2>
          <p>Search above, or use the compare button on any product in the <Link to="/">shop</Link>.</p>
        </div>
      ) : (
        <Table responsive className="data-table compare-table">
          <thead>
            <tr>
              <th aria-label="Feature"></th>
              {products.map((p) => (
                <th key={p._id}>
                  <button
                    type="button"
                    className="compare-remove"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => dispatch(removeFromCompare(p._id))}
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                  <Link to={`/product/${p._id}`} className="compare-product">
                    <img src={imageUrl(p.image)} alt="" />
                    <span>{p.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, render }) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {products.map((p) => <td key={p._id}>{render(p)}</td>)}
              </tr>
            ))}
            <tr>
              <th scope="row" aria-label="Buy"></th>
              {products.map((p) => (
                <td key={p._id}>
                  <Button size="sm" className="w-100" disabled={p.countInStock === 0} onClick={() => addProduct(p)}>
                    {p.countInStock === 0 ? 'Unavailable' : 'Add to cart'}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
      )}
    </>
  )
}

export default CompareScreen
