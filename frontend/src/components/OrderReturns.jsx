import { useCallback, useEffect, useState } from 'react'
import { Button, Form, Image, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { formatPrice } from '../utils/formatPrice'
import { imageUrl } from '../utils/imageUrl'
import ReturnCard from './ReturnCard'

const lineKey = (item) => `${item.product}:${item.color || ''}`

const OrderReturns = ({ orderId }) => {
  const [info, setInfo] = useState(null)
  const [show, setShow] = useState(false)
  const [picked, setPicked] = useState({})
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    // Admins viewing a customer's order aren't the owner, so this simply stays hidden
    api.get(`/returns/order/${orderId}`).then(({ data }) => setInfo(data)).catch(() => setInfo(null))
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  if (!info) return null

  const { returns, returnable, reasons, windowEndsAt } = info
  const chosen = returnable.filter((item) => picked[lineKey(item)] > 0)
  const canSubmit = chosen.length > 0 && reason && (reason !== 'Other' || note.trim())

  const toggle = (item) => {
    const key = lineKey(item)
    setPicked((current) => ({ ...current, [key]: current[key] ? 0 : 1 }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/returns', {
        orderId,
        reason,
        note,
        items: chosen.map((item) => ({ product: item.product, color: item.color, qty: picked[lineKey(item)] })),
      })
      toast.success('Return requested')
      setShow(false)
      setPicked({})
      setReason('')
      setNote('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not request the return')
    } finally {
      setSaving(false)
    }
  }

  if (returns.length === 0 && returnable.length === 0) return null

  return (
    <section className="tracker">
      <h2>Returns</h2>

      {returns.map((ret) => <ReturnCard key={ret._id} ret={ret} />)}

      {returnable.length > 0 && (
        <>
          <p className="table-muted">
            You can return items until {new Date(windowEndsAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}.
          </p>
          <Button variant="outline-primary" size="sm" onClick={() => setShow(true)}>Return items</Button>
        </>
      )}

      <Modal show={show} onHide={() => setShow(false)} centered scrollable>
        <Form onSubmit={submit} className="modal-form">
          <Modal.Header closeButton>
            <Modal.Title>Return items</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {returnable.map((item) => {
              const key = lineKey(item)
              const qty = picked[key] || 0
              return (
                <div key={key} className="return-line">
                  <Form.Check
                    id={`return-${key}`}
                    aria-label={`Return ${item.name}`}
                    checked={qty > 0}
                    onChange={() => toggle(item)}
                  />
                  <Image src={imageUrl(item.image)} alt="" />
                  <label htmlFor={`return-${key}`} className="cart-item-info">
                    <span className="product-title">{item.name}</span>
                    {item.color && <div className="table-muted">{item.color}</div>}
                    <div>{formatPrice(item.price)}</div>
                  </label>
                  {qty > 0 && (
                    <Form.Select
                      className="qty-select"
                      aria-label={`Quantity of ${item.name}`}
                      value={qty}
                      onChange={(e) => setPicked({ ...picked, [key]: Number(e.target.value) })}
                    >
                      {[...Array(item.qty).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </Form.Select>
                  )}
                </div>
              )
            })}

            <Form.Group controlId="returnReason" className="mt-3 mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Select required value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Choose a reason</option>
                {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="returnNote">
              <Form.Label>{reason === 'Other' ? 'Tell us more' : 'Tell us more (optional)'}</Form.Label>
              <Form.Control as="textarea" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={() => setShow(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !canSubmit}>{saving ? 'Sending...' : 'Request return'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </section>
  )
}

export default OrderReturns
