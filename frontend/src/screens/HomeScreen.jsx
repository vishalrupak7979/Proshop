import { useEffect, useRef, useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import AdCarousel from '../components/AdCarousel'
import Paginator from '../components/Paginator'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'
import Message from '../components/Message'
import { fetchProducts } from '../store/slices/productSlice'
import { usePageTitle } from '../utils/usePageTitle'

const SLOW_LOAD_MS = 5000
const SEARCH_DELAY_MS = 300

const HomeScreen = () => {
  const dispatch = useDispatch()
  const { products, page, pages, total, limit, categories, loading, error } = useSelector((state) => state.products)
  const [slowLoad, setSlowLoad] = useState(false)
  const resultsRef = useRef(null)

  // Filters live in the URL, so Back returns to the same page of results
  const [params, setParams] = useSearchParams()
  const pageParam = params.get('page') || '1'
  const search = params.get('search') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || ''
  const [searchText, setSearchText] = useState(search)

  usePageTitle()

  useEffect(() => {
    const request = dispatch(fetchProducts({ page: pageParam, search, category, sort }))
    return () => request.abort()
  }, [dispatch, pageParam, search, category, sort])

  // Render's free tier sleeps, and the first request can take close to a minute
  useEffect(() => {
    const timer = setTimeout(() => setSlowLoad(true), SLOW_LOAD_MS)
    return () => clearTimeout(timer)
  }, [])

  const updateParams = (changes) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('page')
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, value)
        else next.delete(key)
      })
      return next
    })
  }

  // Keeps the box in step when Back or a link changes the search
  useEffect(() => {
    setSearchText(search)
  }, [search])

  useEffect(() => {
    if (searchText === search) return undefined
    const timer = setTimeout(() => updateParams({ search: searchText.trim() }), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  const changePage = (next) => {
    updateParams({ page: next > 1 ? String(next) : '' })
    resultsRef.current?.scrollIntoView({ block: 'start' })
  }

  const clearFilters = () => {
    setSearchText('')
    setParams({})
  }

  const firstLoad = loading && products.length === 0 && total === 0
  const firstItem = (page - 1) * limit + 1
  const lastItem = Math.min(page * limit, total)

  return (
    <>
      <AdCarousel
        fallback={(
          <section className="hero">
            <h1>Tech you&apos;ll actually love using.</h1>
            <p>Phones, laptops, tablets and audio gear, with free delivery across India.</p>
          </section>
        )}
      />

      <div className="toolbar" ref={resultsRef}>
        <Form.Control
          type="search"
          placeholder="Search products or brands"
          aria-label="Search products"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Form.Select aria-label="Sort products" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
          <option value="">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="discount">Biggest discount</option>
        </Form.Select>
      </div>

      <div className="category-pills">
        {['', ...categories].map((c) => (
          <Button
            key={c || 'all'}
            size="sm"
            variant={c === category ? 'primary' : 'outline-secondary'}
            aria-pressed={c === category}
            onClick={() => updateParams({ category: c })}
          >
            {c || 'All'}
          </Button>
        ))}
      </div>

      {firstLoad ? (
        <>
          {slowLoad && <p className="slow-note">The store is waking up. This can take up to a minute.</p>}
          <Row className="g-4">
            {[...Array(8).keys()].map((x) => (
              <Col key={x} xs={6} md={4} xl={3}>
                <ProductSkeleton />
              </Col>
            ))}
          </Row>
        </>
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : total === 0 ? (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Try a different search or category.</p>
          <Button variant="outline-secondary" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className={loading ? 'product-results is-refreshing' : 'product-results'}>
          <p className="result-count" aria-live="polite">Showing {firstItem}–{lastItem} of {total} products</p>
          <Row className="g-4">
            {products.map((product) => (
              <Col key={product._id} xs={6} md={4} xl={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
          <Paginator page={page} pages={pages} onChange={changePage} />
        </div>
      )}
    </>
  )
}

export default HomeScreen
