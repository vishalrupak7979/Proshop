import React, { useEffect, useMemo, useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { fetchProducts } from '../store/slices/productSlice'

const SORTERS = {
  featured: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
}

const HomeScreen = () => {
  const dispatch = useDispatch()
  const { products, loading, error } = useSelector((state) => state.products)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  )

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products
      .filter((p) => category === 'All' || p.category === category)
      .filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(term))
      .sort(SORTERS[sort])
  }, [products, search, category, sort])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
  }

  return (
    <>
      <section className="hero">
        <h1>Tech you&apos;ll actually love using.</h1>
        <p>Phones, laptops, tablets and audio gear, with free delivery across India.</p>
      </section>

      <div className="toolbar">
        <Form.Control
          type="search"
          placeholder="Search products or brands"
          aria-label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Form.Select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </Form.Select>
      </div>

      <div className="category-pills">
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={c === category ? 'primary' : 'outline-secondary'}
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : visibleProducts.length === 0 ? (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Try a different search or category.</p>
          <Button variant="outline-secondary" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <Row className="g-4">
          {visibleProducts.map((product) => (
            <Col key={product._id} xs={6} md={4} xl={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

export default HomeScreen
