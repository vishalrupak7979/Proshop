import { useEffect, useState } from 'react'
import { Button, Carousel } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaRegCopy } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { imageUrl } from '../utils/imageUrl'
import { savePromoCode } from '../utils/promoCode'

const AdContent = ({ ad }) => (
  <>
    <img src={imageUrl(ad.image)} alt="" />
    <div className="ad-text">
      <strong>{ad.title}</strong>
      {ad.text && <span>{ad.text}</span>}
    </div>
  </>
)

const copyCode = async (code) => {
  savePromoCode(code)
  try {
    await navigator.clipboard.writeText(code)
    toast.success(`${code} copied. It will be ready at checkout`, { toastId: code })
  } catch (e) {
    toast.success(`${code} saved. It will be ready at checkout`, { toastId: code })
  }
}

const AdCarousel = ({ fallback }) => {
  const [ads, setAds] = useState(null)

  useEffect(() => {
    api.get('/ads').then(({ data }) => setAds(data)).catch(() => setAds([]))
  }, [])

  if (!ads) return fallback
  if (ads.length === 0) return fallback

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <Carousel
      className="ad-carousel"
      interval={reduceMotion ? null : 5000}
      controls={ads.length > 1}
      indicators={ads.length > 1}
      slide={!reduceMotion}
    >
      {ads.map((ad) => (
        <Carousel.Item key={ad._id}>
          {!ad.link ? (
            <div className="ad-slide"><AdContent ad={ad} /></div>
          ) : ad.link.startsWith('/') ? (
            <Link to={ad.link} className="ad-slide"><AdContent ad={ad} /></Link>
          ) : (
            <a href={ad.link} target="_blank" rel="noopener noreferrer sponsored" className="ad-slide"><AdContent ad={ad} /></a>
          )}

          {ad.couponCode && (
            <div className="ad-coupon">
              <span>Use code</span>
              <code>{ad.couponCode}</code>
              <Button size="sm" variant="light" aria-label={`Copy code ${ad.couponCode}`} onClick={() => copyCode(ad.couponCode)}>
                <FaRegCopy aria-hidden="true" /> Copy
              </Button>
            </div>
          )}
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default AdCarousel
