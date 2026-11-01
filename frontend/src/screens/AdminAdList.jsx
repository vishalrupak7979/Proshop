import { useEffect, useRef, useState } from 'react'
import { Badge, Button, Card, Col, Form, Image, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import ImagePicker from '../components/ImagePicker'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { imageUrl } from '../utils/imageUrl'
import { SAMPLE_BANNERS } from '../utils/sampleBanners'
import { usePageTitle } from '../utils/usePageTitle'

const EMPTY_AD = { title: '', text: '', image: '', link: '', startsAt: '', endsAt: '' }

const toIso = (value) => (value ? new Date(value).toISOString() : undefined)

const AdminAdList = () => {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_AD)
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)

  usePageTitle('Advertisements')

  useEffect(() => {
    axios.get('/ads/all')
      .then(({ data }) => setAds(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load advertisements'))
      .finally(() => setLoading(false))
  }, [])

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // Fills the form so the admin can adjust the wording before publishing
  const applySample = ({ image, title, text }) => {
    setForm((current) => ({ ...current, image, title, text }))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const createAd = async (e) => {
    e.preventDefault()
    if (!form.image) {
      toast.error('Add an advert image')
      return
    }

    setSaving(true)
    try {
      const { data } = await axios.post('/ads', { ...form, startsAt: toIso(form.startsAt), endsAt: toIso(form.endsAt) })
      setAds((current) => [data, ...current])
      setForm(EMPTY_AD)
      toast.success('Advert published')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not publish the advert')
    } finally {
      setSaving(false)
    }
  }

  const toggleAd = async (ad) => {
    try {
      const { data } = await axios.put(`/ads/${ad._id}`, { ...ad, isActive: !ad.isActive })
      setAds((current) => current.map((a) => (a._id === data._id ? data : a)))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the advert')
    }
  }

  const deleteAd = async (ad) => {
    if (!window.confirm(`Delete the advert "${ad.title}"?`)) return

    try {
      await axios.delete(`/ads/${ad._id}`)
      setAds((current) => current.filter((a) => a._id !== ad._id))
      toast.success('Advert deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the advert')
    }
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  return (
    <>
      <h1 className="page-title">Advertisements</h1>

      <section className="sample-banners">
        <h2>Sample banners</h2>
        <p>Choose one to fill in the form, then edit the wording and publish it.</p>
        <div className="sample-grid">
          {SAMPLE_BANNERS.map((banner) => (
            <button
              key={banner.image}
              type="button"
              className={form.image === banner.image ? 'sample-banner is-selected' : 'sample-banner'}
              aria-pressed={form.image === banner.image}
              onClick={() => applySample(banner)}
            >
              <img src={imageUrl(banner.image)} alt="" loading="lazy" />
              <span>{banner.name}</span>
            </button>
          ))}
        </div>
      </section>

      <Row className="g-4">
        <Col lg={8}>
          {ads.length === 0 ? (
            <div className="empty-state">
              <h2>No advertisements yet</h2>
              <p>Adverts appear as a banner at the top of the home page.</p>
            </div>
          ) : (
            <Table responsive hover className="data-table">
              <thead>
                <tr>
                  <th>Advert</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad._id}>
                    <td>
                      <div className="table-product">
                        <Image src={imageUrl(ad.image)} alt="" />
                        <span>
                          {ad.title}
                          {ad.link && <div className="table-muted">{ad.link}</div>}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge bg={ad.isActive ? 'success' : 'secondary'}>{ad.isActive ? 'Showing' : 'Paused'}</Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button size="sm" variant="outline-primary" onClick={() => toggleAd(ad)}>
                          {ad.isActive ? 'Pause' : 'Resume'}
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => deleteAd(ad)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col lg={4}>
          <Card className="summary-card" ref={formRef}>
            <Card.Body>
              <h2>New advert</h2>
              <Form onSubmit={createAd}>
                <ImagePicker label="Banner image (wide works best)" value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} />
                <Form.Group controlId="title" className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control required value={form.title} onChange={setField('title')} />
                </Form.Group>
                <Form.Group controlId="text" className="mb-3">
                  <Form.Label>Text (optional)</Form.Label>
                  <Form.Control value={form.text} onChange={setField('text')} />
                </Form.Group>
                <Form.Group controlId="link" className="mb-3">
                  <Form.Label>Link (optional)</Form.Label>
                  <Form.Control placeholder="/product/... or https://..." value={form.link} onChange={setField('link')} />
                </Form.Group>
                <Form.Group controlId="startsAt" className="mb-3">
                  <Form.Label>Starts (optional)</Form.Label>
                  <Form.Control type="datetime-local" value={form.startsAt} onChange={setField('startsAt')} />
                </Form.Group>
                <Form.Group controlId="endsAt" className="mb-3">
                  <Form.Label>Ends (optional)</Form.Label>
                  <Form.Control type="datetime-local" value={form.endsAt} onChange={setField('endsAt')} />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={saving}>
                  {saving ? 'Publishing...' : 'Publish advert'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AdminAdList
